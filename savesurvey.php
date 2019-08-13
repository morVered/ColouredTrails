<?php
$data = $_POST['jsonString'];
//set mode of file to writable.
chmod("survey.csv",0777);
$fp = fopen("survey.csv", "a+");
fwrite($fp, $data . PHP_EOL);
fclose($fp);
?>