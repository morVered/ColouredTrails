<?php
$data = $_POST['jsonString'];
//set mode of file to writable.
chmod("demographics.csv",0777);
$fp = fopen("demographics.csv", "a+");
fwrite($fp, $data . PHP_EOL);
fclose($fp);
?>