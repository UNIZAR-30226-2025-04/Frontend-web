<script lang="ts">
    import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { apiBaseStore, signupPath } from '$lib/paths';
    import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
    import { get } from 'svelte/store';

	const errorContainer = 'alert variant-ghost-error p-2';
    const errorMessagePasswd = 'alert-message text-left text-black'

	let email = '';
	let username = '';
	let passwd1 = '';
	let passwd2 = '';
	let errorMessage = false;
	let error:string = '';

	const toastStore = getToastStore();

	const accountCreatedToast:ToastSettings = {
		message: 'Account created!',
		background: 'variant-filled-primary',
		timeout: 3500,
		classes: 'gap-[0px]'
	};
  
	/**
	 * Registers the user with the form data
	 * @param event
	 * @async
	 */
	async function register(event: SubmitEvent) {
		event.preventDefault();

		errorMessage = passwd1 !== passwd2;

		let success = false;

		console.log("Email:", email);
		console.log("Username:", username);
		console.log("Password:", passwd1);
		console.log("Password:", passwd2);

		if(!errorMessage){
			const formData = new URLSearchParams();
			formData.append("username", username);
			formData.append("email", email);
			formData.append("password", passwd1);
			formData.append("icon", "1");

			errorMessage = false;

			try {
				const response = await fetch(get(apiBaseStore) + signupPath, {
					method: 'POST',
					headers: {
						'accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: formData.toString()
				});

				if (!response.ok) {
					throw new Error("Error on autentication");
				}

				const data = await response.json();
				success = true;
				console.log("API Response:", data);
			} catch (err:any) {
				error = err.message;
			}

			if(success){
				goto(base+"/login");
				toastStore.trigger(accountCreatedToast);
				// TODO make the user autologin when creating an account
			}else{
				errorMessage = true;
			}
		}
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
				Error on register: {error}
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