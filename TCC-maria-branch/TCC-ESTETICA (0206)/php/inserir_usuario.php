<?php

/* altere aqui as perguntas do forms*/
$username = $_POST['username'];
$phone = $_POST['phone'];
$email = $_POST['email'];
$password = $_POST['password'];

/* string de conexao*/
$strcon = mysqli_connect('localhost','root','','bancotcc') or
die('Erro ao conectar ao banco de dados');

/* aqui são as variaveis das novas perguntas */
$sql = "INSERT INTO tb_usuarios (usuario, telefone, email, senha) VALUES ";
$sql .= "('$username','$phone','$email','$password')";
 
/* aqui conexão com o banco*/
mysqli_query($strcon,$sql) or die("Erro ao tentar cadastrar registro");
mysqli_close($strcon);
echo "Cliente cadastrado com sucesso!";
header('Location: ../cadastro.html');

?>