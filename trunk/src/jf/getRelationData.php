<?php
/**
 * 级联ajax获取数据示例
 */
$data=array();
$data[1]=array(11=>'h',12=>'i');
$data[2]=array(21=>'j',22=>'k');
$id=$_GET['id'];

if(isset($data[$id])){
  echo json_encode($data[$id]);
}else{
  echo '{}';
}
die;