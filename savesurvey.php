<?php
$filename = 'Results/' . $_POST['filename'];

$data = $_POST['jsonString'];
//set mode of file to writable.

firstLine = 'Survey,PlayerID,Condition,Timestamp,Response\n';

chmod($filename,0777);
$fp = fopen($filename,'a');
if(filesize($filename)==0){
    fwrite($fp,firstline . PHP_EOL)}
fwrite($fp, $data . PHP_EOL);
fclose($fp);


?>