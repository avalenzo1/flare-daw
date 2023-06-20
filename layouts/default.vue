<template>
  <div class="flex justify-center h-screen py-5">
    <header class="p-6">
      <div class="mb-4">
        <h1 class="text-lg tracking-wide">Flare Daw</h1>
        <p class="font-thin">1.0.0 Alpha</p>
      </div>
      
      <UVerticalNavigation :links="links" />
    </header>

    <aside class="flex-grow p-6">
      <slot />
    </aside>
  </div>
</template>

<script setup>
  const links = [{
    label: 'Projects',
    icon: 'i-heroicons-home',
    to: '/'
  }, {
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/settings'
  }]
</script>