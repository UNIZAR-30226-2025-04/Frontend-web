<script lang="ts">
  import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
  import { userDataStore } from '$lib/stores';
  import { base } from '$app/paths';

  const modalStore = getModalStore();
  
  const modalInfoChange: ModalSettings = {
    type: 'component',
    component: 'infoChangeModal'
  };

  const modalCreateLobby: ModalSettings = {
    type: 'component',
    component: 'createLobbyModal'
  };

  const modalFriends: ModalSettings = {
    type: 'component',
    component: 'friendsModal'
  }
  
  function clickOnProfile(){
    modalStore.trigger(modalInfoChange);
  }

  function clickOnHost(){
    modalStore.trigger(modalCreateLobby);
  }

  function clickOnFriends(){
    modalStore.trigger(modalFriends);
  }

</script>




<!-- Game logo -->
<img class='mt-[2vh] h-[50vmin] w-auto' src='nogler.png' alt="Nogler" />

  <!-- Button bar -->
  <div class="gap-[2vmin] mt-[4%] flex">
    <!-- Profile card -->
    <div class="card p-3 text-[clamp(14px,1.7vmin,999px)]">
      Profile
      <!-- Profile button -->
      <button class="block card p-3 mt-3" on:click={clickOnProfile}>
        {$userDataStore.username}
      </button>
    </div>

    <!-- Game buttons -->
    <div class="card flex p-3 gap-3">
      <!-- JOIN -->
      <button class="block card p-3 content-center text-[clamp(20px,3.5vmin,999px)] w-[clamp(100px,17vmin,999px)] break-words">
        <a href="{base}/lobbies">JOIN</a>
      </button>

      <!-- HOST -->
      <button class="block card p-3 content-center text-[clamp(20px,3.5vmin,999px)] w-[clamp(100px,17vmin,999px)]" on:click={clickOnHost}>
        HOST
      </button>

      <!-- INBOX -->
      <button class="block card p-3 content-center text-[clamp(20px,3.5vmin,999px)] w-[clamp(100px,17vmin,999px)]">
        INBOX
      </button>

      <!-- FRIENDS -->
      <button class="block card p-3 content-center text-[clamp(20px,3.5vmin,999px)] w-[clamp(100px,17vmin,999px)]" on:click={clickOnFriends}>
        FRIENDS
      </button>
    </div>

    <!-- Github button -->
    <div class="content-center">
      <a href="https://github.com/UNIZAR-30226-2025-04">
        <img src="github.svg" alt="Github logo" class="w-[clamp(40px,4vmin,999px)] mx-auto"/>
        <div class="card p-3 text-[clamp(14px,1.7vmin,999px)]">
          Github
        </div>
      </a>
    </div>
  </div> 


<style>
.card{
  border-width: 1px;
}
</style>