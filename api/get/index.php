<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=UTF-8");

$url = "https://cist.nure.ua/ias/app/tt/P_API_EVEN_JSON?type_id=1&timetable_id=" . $_GET["group_id"] . "&idClient=KNURESked";   
$ch = curl_init(); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_URL, $url);
$res = curl_exec($ch);
$res = mb_convert_encoding($res, "utf-8", "windows-1251");
echo $res;   
?>