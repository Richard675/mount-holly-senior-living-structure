<?php
/* Direct inquiry handler. Requires PHP 8+ and configured server email delivery. */
declare(strict_types=1);
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
$isJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
function respond(int $status, bool $ok, string $message): never {
    global $isJson;
    http_response_code($status);
    if ($isJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $title = $ok ? 'Thank you.' : 'Please try again.';
        $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
        echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inquiry | Mount Holly Senior Living</title><link rel="icon" href="../images/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../styles.css"></head>'
            .'<body><main class="wrap message-page"><div><img src="../images/brand-mark.webp" alt="Mount Holly Senior Living" width="170" height="140" style="margin:0 auto 32px;height:110px;width:auto">'
            .'<h1>'.$title.'</h1><p class="lead">'.$safe.'</p><div class="button-row">'
            .($ok ? '<a class="button" href="../index.html">Return to the homepage</a>' : '<a class="button" href="../contact.html">Return to the contact page</a><a class="button button-ghost" href="mailto:info@mounthollyseniorliving.com">Email our team</a>')
            .'</div></div></main></body></html>';
    }
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, false, 'Please submit the inquiry form.');
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 16000) respond(413, false, 'Your inquiry is too long.');
// Reject cross-site browser requests; direct navigation and clients without Origin remain supported.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$originHost = parse_url($origin, PHP_URL_HOST);
$host = explode(':', $_SERVER['HTTP_HOST'] ?? '')[0];
if ($origin !== '' && $originHost !== $host) respond(403, false, 'Please submit from our website.');
if (isset($_POST['website']) && $_POST['website'] !== '') respond(400, false, 'Your inquiry could not be accepted.');
function field(string $key, int $max): string {
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || strlen($value) > $max) respond(422, false, 'Please check your form details.');
    return trim($value);
}
$name = field('name', 100);
$email = field('email', 200);
$phone = field('phone', 40);
$date = field('visit_date', 10);
$interest = field('interest', 80);
$message = field('message', 1500);
if ($name === '' || preg_match('/[\r\n]/', $name.$email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(422, false, 'Please enter a valid name and email address.');
$allowed = ['Schedule a Private Visit', 'Ask about availability', 'Discuss care options', 'General question'];
if (!in_array($interest, $allowed, true)) respond(422, false, 'Please select how we can help.');
if ($date !== '') {
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    if (!$parsed || $parsed->format('Y-m-d') !== $date || $date < date('Y-m-d')) respond(422, false, 'Please select a current or future visit date.');
}
// Persistent short-window IP throttling in a private directory outside the web root.
$dir = sys_get_temp_dir().'/mount-holly-inquiry-limits';
if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) respond(503, false, 'The inquiry service is temporarily unavailable. Please email our team.');
$key = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$handle = @fopen($dir.'/'.$key, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) respond(503, false, 'The inquiry service is temporarily unavailable.');
$last = (int)stream_get_contents($handle);
if ($last > time() - 60) { fclose($handle); respond(429, false, 'Please wait a minute before submitting another inquiry.'); }
ftruncate($handle, 0); rewind($handle); fwrite($handle, (string)time()); flock($handle, LOCK_UN); fclose($handle);
$recipient = 'info@mounthollyseniorliving.com';
$body = "New website inquiry\n\nName: $name\nEmail: $email\nPhone: $phone\nInterest: $interest\nPreferred visit date: $date\n\nMessage:\n$message\n";
$headers = ['From' => 'Mount Holly Senior Living <website@mounthollyseniorliving.com>', 'Reply-To' => $email, 'Content-Type' => 'text/plain; charset=UTF-8'];
// Encode the subject so the em dash survives every mail client.
$subject = '=?UTF-8?B?'.base64_encode('Mount Holly Senior Living — Website Inquiry').'?=';
if (!@mail($recipient, $subject, $body, $headers)) respond(503, false, 'Your inquiry could not be sent. Please email info@mounthollyseniorliving.com.');
respond(200, true, 'Your inquiry has been submitted. Our team will follow up to arrange your visit.');
