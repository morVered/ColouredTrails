<?php


$filename = 'Results/' . $_POST['filename'];

$data = $_POST['jsonString'];
//set mode of file to writable.

firstLine = 'PlayerID,Condition,GameID,CurrentGame,Timestamp,CurrentPlayer,Action,ChipsRequested,ChipsRequestedPlayers,ExtraChips,NeededChips,Score,TimeRemaining\n';

chmod($filename,0777);
$fp = fopen($filename,'a');
if(filesize($filename)==0){
    fwrite($fp,firstline . PHP_EOL)}
fwrite($fp, $data . PHP_EOL);
fclose($fp);


?>