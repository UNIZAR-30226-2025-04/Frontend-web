<svelte:head>
  <style>
    @font-face {
      font-family: 'Pixelify Sans';
      src: url('/fonts/PixelifySans-Medium.otf') format('woff'),
    }
  </style>
</svelte:head>

<script lang="ts">

	let email = '';
	let passwd = '';
	let remember = false;
  
	// Test handler function
	function login(event: SubmitEvent): void {
	  event.preventDefault();
	  console.log("Email:", email);
	  console.log("Password:", passwd);
	  console.log("Remember me:", remember);
	}

</script>

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
        margin-top: 150px;
	}
  
	.login h1 {
	  	margin-bottom: 10px;
	}
  
	.login a {
	  	text-decoration: underline;
	}
  
	.login-form {
	  	margin-top: 20px;
	  	background: rgba(255, 255, 255, 0.575);
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
	  	color: #333333;
	}
  
	input[type="email"],
	input[type="password"] {
	  	width: 100%;
	  	padding: 10px;
	  	margin-top: 5px;
	  	margin-bottom: 25px;
	  	border: 1px solid #ccc;
	  	border-radius: 15px;
	  	color: #333333;
	  	background-color: #ffffff;
	  	box-sizing: border-box;
	}
  
	button {
	  	background-color: #7d2e2e;
	  	color: white;
	  	padding: 10px;
	  	border: none;
	  	border-radius: 15px;
	  	cursor: pointer;
	  	margin-top: 20px;
	  	width: 100%;
	}
  
	button:hover {
		background-color: #a82c2c;
	}
</style>

<div class="login"> 
  <h1>Welcome back!</h1>
  <p>Don't have an account yet? <a href="/">Create account</a></p>
  
  <div class="login-form">
    <form id="login-form" on:submit={login}> 
      <label for="email">Email</label>
      <input 
        type="email" 
        id="email" 
        bind:value={email} 
        name="email" 
        placeholder="your-email@example.com"
        required
      >
      
      <label for="passwd">Password</label>
      <input 
        type="password" 
        id="passwd" 
        bind:value={passwd} 
        name="passwd" 
        placeholder="Your password"
        required
      >
      
      <label class="flex items-center space-x-2">
        <input 
          class="checkbox" 
          type="checkbox" 
          id="remember" 
          bind:checked={remember} 
          name="remember"
        >
        <span>Remember me</span>
      </label>
      
      <button type="submit">Login</button>
    </form>
  </div>
</div>