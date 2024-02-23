<script setup lang="ts">
let props = defineProps<{
    requirements: string[]
}>();
function requirementToSymbol(requirement: string) {
    if (requirement.includes("Noodle Extensions")) {
        return "🍜";
    }
    if (requirement.includes("Chroma")) {
        return "🌈";
    }
    if (requirement.includes("Mapping Extensions")) {
        return "📐";
    }
    return "❓";
}
</script>

<template>
    <p class="requirements">
        <span v-for="req in props.requirements" :key="req" :title="req">
            {{ requirementToSymbol(req) }}
        </span>
    </p>
</template>

<style>
.requirements {
    display: inline-block;
}
</style>