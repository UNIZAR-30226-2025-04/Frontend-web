<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<style>
	body {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		margin: 0;
		background-color: #494949;
	}

	.login {
		text-align: center;
		color: rgb(255, 255, 255);
		margin-bottom: 175px;
	}

	.login h1 {
		margin-bottom: 10px;
	}

	.login a {
		text-decoration: underline;
	}

	.login-form {
		margin-top: 20px;
		background: rgb(56, 56, 56);
		padding: 30px;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		text-align: center;
		width: 550px;
		display: flex;
		flex-direction: column;
	}

	.login-form label {
		text-align: left;
	}

	input[type="text"], 
	input[type="password"] {
		width: 100%;
		padding: 10px;
		margin-top: 5px;
		margin-bottom: 25px;
		border: 1px solid #ccc;
		border-radius: 15px;
		
	}

	button {
		background-color: #9f63ff;
		color: white;
		padding: 10px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		margin-top: 20px;
		width: 100%;
		border-radius: 15px;
	}

	button:hover {
		background-color: rgb(95, 0, 173);
	}

</style>

<body>
  
	<div class="login"> 
		<h1> Welcome back! </h1>
		<p> Do not have an account yet? <a href='/'>Create account</a> </p>

		<div class="login-form">

			<form id="login-form"> 
				<label for="email">Email</label>
				<input type="text" id="email" name="email" placeholder="your-email@example.com">
			
				<label for="passwd">Password</label>
				<input type="password" id="passwd" name="passwd" placeholder="Your paassword">
			
				<label class="flex items-center space-x-2">
					<input class="checkbox" type="checkbox" id="remember" name="remember">
					<label for="remember">Remember me</label>
				</label>
			
				<button type="submit">Login</button>
			</form>
		
		</div>
	</div>
		

</body>
