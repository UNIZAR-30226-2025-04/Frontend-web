<script lang="ts">
	import { base } from '$app/paths';

	const errorContainer = 'alert variant-ghost-error p-2';
    const errorMessagePasswd = 'alert-message text-left text-black'

	let email = '';
	let username = '';
	let passwd1 = '';
	let passwd2 = '';
	let errorMessage = false;
  
	// Test handler function
	function register(event: SubmitEvent): void {
	  event.preventDefault();

	  errorMessage = true;

	  console.log("Email:", email);
	  console.log("Username:", username);
	  console.log("Password:", passwd1);
	  console.log("Password:", passwd2);
	}

</script>



<div class="register"> 
  <h1>Create an account on Nøgler!</h1>
  <p>Already have an account? <a href="{base}/login">Sing in</a></p>
  
  <div class="register-form">
    <form id="register-form" on:submit={register}> 
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
		<aside class="{errorContainer}">
			<div class="{errorMessagePasswd}">
				Password doesn't match
			</div>
		</aside>
	  {/if}
      
      <button type="submit">Register</button>
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
  
	.register {
	  	text-align: center;
	  	color: rgb(255, 255, 255);
        margin-top: 120px;
	}
  
	.register h1 {
	  	margin-bottom: 10px;
		font-size: 30px;
	}

	.register p {
		font-size: 20px;
	}
  
	.register a {
	  	text-decoration: underline;
	}
  
	.register-form {
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
  
	.register-form label {
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