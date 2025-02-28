<script lang="ts">
  import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
  import { userDataStore } from '$lib/stores';

  const modalStore = getModalStore();
  
  const modalInfoChange: ModalSettings = {
    type: 'component',
    component: 'infoChangeModal'
  };

  const modalCreateLobby: ModalSettings = {
    type: 'component',
    component: 'createLobbyModal'
  };
  
  function clickOnProfile(){
    modalStore.trigger(modalInfoChange);
  }

  function clickOnJoin(){
    modalStore.trigger(modalCreateLobby);
  }

</script>




<!-- Game logo -->
<img class='logo' src='nogler.png' alt="Nogler" style="margin-top: 50px; width: 55%;"/>

<!-- Button bar -->
<div class="gap-7 mt-10 flex">
  <!-- Profile card -->
  <div class="card p-3 text-[20px]">
    Profile
    <!-- Profile button -->
    <button class="block card p-3 mt-3" on:click={clickOnProfile}>
      {$userDataStore.username}
    </button>
  </div>

  <!-- Game buttons -->
  <div class="card flex p-3 gap-3">
    <!-- JOIN -->
    <button class="block card p-3 content-center text-[40px] w-[190px]" on:click={clickOnJoin}>
      JOIN
    </button>

    <!-- HOST -->
    <button class="block card p-3 content-center text-[40px] w-[190px]">
      HOST
    </button>

    <!-- INBOX -->
    <button class="block card p-3 content-center text-[40px] w-[190px]">
      INBOX
    </button>

    <!-- FRIENDS -->
    <button class="block card p-3 content-center text-[40px] w-[190px]">
      FRIENDS
    </button>
  </div>

  <!-- Github button -->
  <div class="content-center">
    <a href="https://github.com/UNIZAR-30226-2025-04">
      <img src="github.svg" alt="Github logo" class="w-12 mx-auto"/>
      <div class="card p-3 text-[20px]">
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