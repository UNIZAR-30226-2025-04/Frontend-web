<script lang="ts">

	let email = '';
	let username = '';
	let passwd1 = '';
	let passwd2 = '';
	let errorMessage = "";
  
	// Test handler function
	function login(event: SubmitEvent): void {
	  event.preventDefault();

	  if(passwd1 != passwd2){
			errorMessage = "Oops! Your passwords don't match. Please re-enter them.";
			return;
	  }

	  console.log("Email:", email);
	  console.log("Username:", username);
	  console.log("Password:", passwd1);
	  console.log("Password:", passwd2);
	}

</script>



<div class="login"> 
  <h1 style="font-size: 30px;">Create an account on Nøgler!</h1>
  <p style="font-size: 20px;">Already have an account? <a href="login">Sing in</a></p>
  
  <div class="login-form">
    <form id="login-form" on:submit={login}> 
      <label for="email">Email</label>
      <input 
        type="email" 
        id="email" 
        bind:value={email}
        placeholder="your-email@example.com"
        required
      >

	  <label for="username">Username</label>
      <input 
        type="text"
        id="username" 
        bind:value={username} 
        placeholder="Your username"
        required
      >
      
      <label for="passwd">Password</label>
      <input 
        type="password" 
        id="passwd1" 
        bind:value={passwd1} 
        placeholder="Your password"
        required
      >

	  <label for="passwd">Repeat your password</label>
      <input 
        type="password" 
        id="passwd2" 
        bind:value={passwd2} 
        placeholder="Your password"
        required
      >

	  {#if errorMessage}
		<span style="font-size: 18px; color: red;">{errorMessage}</span>
	  {/if}
      
      <button type="submit">Login</button>
    </form>
  </div>
</div>

<style>
	:global(body) {
	  	background-image: url('/5.jpg') !important;
	  	display: flex;
	  	justify-content: center;
	  	font-family: 'Pixelify Sans'
	}
  
	.login {
	  	text-align: center;
	  	color: rgb(255, 255, 255);
        margin-top: 120px;
	}
  
	.login h1 {
	  	margin-bottom: 10px;
	}
  
	.login a {
	  	text-decoration: underline;
	}
  
	.login-form {
	  	margin-top: 20px;
	  	background: rgba(255, 255, 255, 0.863);
	  	padding: 30px;
	  	border-radius: 10px;
	  	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	  	text-align: center;
	  	width: 550px;
	  	display: flex;
	  	flex-direction: column;
		font-size: 18px;
	}
  
	.login-form label {
	  	text-align: left;
	  	color: #333333;
	}
  
	input {
	  	width: 100%;
	  	padding: 10px;
	  	margin-top: 5px;
	  	margin-bottom: 25px;
	  	border: 1px solid #ccc;
	  	border-radius: 15px;
	  	color: #333333;
	  	background-color: #ffffff;
	  	box-sizing: border-box;
		font-size: 17px;
	}
  
	button {
	  	background-color: #7d2e2e;
	  	color: white;
	  	padding: 10px;
	  	border-radius: 15px;
	  	cursor: pointer;
	  	margin-top: 20px;
	  	width: 100%;
	}
  
	button:hover {
		background-color: #a82c2c;
	}
</style>