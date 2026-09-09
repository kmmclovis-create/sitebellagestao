<?php
$usuarioid = $_POST['id'] ?? ''; 
/* altere aqui as perguntas do forms*/
$nome = $_POST['nome'];
$procedimento = $_POST['procedimento'];
$hora = $_POST['hora'];
$data = $_POST['data'];

/* string de conexao*/
$strcon = mysqli_connect('localhost','root','','bancotcc') or
die('Erro ao conectar ao banco de dados');

/* aqui são as variaveis das novas perguntas */
$sql = "INSERT INTO tb_agendamentos (nome_cliente, procedimentos, horario, data, tb_usuarios_id_user) VALUES ";
$sql .= "('$nome','$procedimento','$hora','$data','$usuarioid')";
 
/* aqui conexão com o banco*/
mysqli_query($strcon,$sql) or die("Erro ao tentar cadastrar registro");
mysqli_close($strcon);
echo "Cliente cadastrado com sucesso!";
header('Location: ../agendamentos.php');
?>