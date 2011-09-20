<?php
$id=$_POST['id'];
$result=array('msg'=>"提交的内容是:".$id,"time"=>date('Y-m-d H:i:s'));
echo json_encode($result);