<?php
	// inclui arquivo de conexao
	session_start();
	
	include('conexao.php');
	
	$usuarioid = $_POST['id'] ?? ''; 

	if(empty($_POST['email']) || empty($_POST['password'])) {
	header('Location:../login.php');
	exit();
    }
	
	$email = mysqli_real_escape_string($conexao, $_POST['email']);
	$password = mysqli_real_escape_string($conexao, $_POST['password']);
	//$senha = md5($senha);
	
	/*query de consulta*/
	$query = "SELECT id_user, email
          FROM tb_usuarios
          WHERE email = '{$email}'
          AND senha = '{$password}'";
	//echo $query;exit;
	
	$result = mysqli_query($conexao, $query);
	
	if(mysqli_num_rows($result) == 1){

		$usuario = mysqli_fetch_assoc($result);
	
		$_SESSION['email'] = $usuario['email'];
	
		header('Location: ../agendamentos.php?id=' . $usuario['id_user']);
	}
	else {
		header('Location: ../login.php');
		exit();
	}