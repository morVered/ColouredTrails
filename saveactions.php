<?php
$data = $_POST['jsonString'];
//set mode of file to writable.
chmod("actions.csv",0777);
$fp = fopen("actions.csv", "a+");
fwrite($fp, $data . PHP_EOL);
fclose($fp);
?>