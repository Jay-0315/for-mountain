<?php
/**
 * PHP Reverse Proxy
 * /api/v1/... 및 /uploads/... 요청을 localhost:8081 (Spring Boot) 로 중계
 */

$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// /uploads/xxx → /api/v1/uploads/files/xxx 로 변환
if (preg_match('#^/uploads/(.+)$#', $uri, $m)) {
    $uri = '/api/v1/uploads/files/' . $m[1];
}

$backend = 'http://127.0.0.1:8081' . $uri;

$ch = curl_init($backend);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// 요청 바디 전달 (POST/PUT/PATCH)
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// 헤더 전달 (Host 제외)
$headers = [];
foreach (getallheaders() as $k => $v) {
    if (strtolower($k) === 'host') continue;
    $headers[] = "$k: $v";
}

// xserver/FastCGI 환경에서는 Authorization 헤더가 getallheaders()에
// 누락될 수 있어 서버 변수에서 한 번 더 보정한다.
if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
} elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $headers[] = 'Authorization: ' . $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_HEADER, true);

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Backend unavailable: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

$headerSize  = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$statusCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$body        = substr($response, $headerSize);
$rawHeaders  = substr($response, 0, $headerSize);
curl_close($ch);

http_response_code($statusCode);

// 응답 헤더 전달 (일부 제외)
$skipHeaders = ['transfer-encoding', 'connection', 'keep-alive', 'upgrade'];
foreach (explode("\r\n", $rawHeaders) as $h) {
    if (empty($h) || preg_match('/^HTTP\//i', $h)) continue;
    $lower = strtolower(explode(':', $h)[0]);
    if (in_array($lower, $skipHeaders)) continue;
    header($h, false);
}

echo $body;
