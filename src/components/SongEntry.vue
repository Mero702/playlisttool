<script setup lang="ts">
import Delete from "@/components/icons/Delete.vue";
import Requirements from "./Requirements.vue";

import { ref, defineEmits } from "vue";
import { isShorthandPropertyAssignment } from "typescript";
let props = defineProps<{
    song: Song
}>();
let emit = defineEmits({
    delete: (entry: string) => { }
});

function difficultyToString() {
    return props.song.difficulty.map((d) => {
        return d.name;
    }).join(", ");
}
function mapRequirements() {
    return [...new Set(props.song.difficulty.reduce((acc, d) => {
        return acc.concat(d.requirements);
    }, [] as string[]))].sort();
}
</script>
<template>
    <div :title="props.song.id" class="entry">
        <img :src="props.song.albumCover" :alt="props.song.name" />
        <div class="info">
            <p :title="props.song.name">Title: {{ props.song.name }}</p>
            <p :title="props.song.songAuthor">Artist: {{ props.song.songAuthor }}</p>
            <p :title="props.song.levelAuthor">Mapper: {{ props.song.levelAuthor }}</p>
            <p>BPM: {{ props.song.beatsPerMinute }} <span v-if="mapRequirements().length >= 1">|</span>
                <Requirements :requirements="mapRequirements()" />
            </p>
            <p :title="difficultyToString()" v-text="difficultyToString()"></p>
        </div>
        <button v-on:click="emit('delete', props.song.id)">
            <Delete />
        </button>
    </div>
</template>

<style scoped>
.entry {
    --border-radius: .75rem;
    position: relative;
    width: 100%;
    height: 125px;
    display: grid;
    grid-template-columns: fit-content(100px) 1fr fit-content(50px);
    gap: 1ch;
    outline: 2px solid var(--color-text);
    border-radius: var(--border-radius);
}

.entry .info {
    display: flex;
    max-height: 100%;
    flex-direction: column;
    padding: .25ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.entry img {
    aspect-ratio: 1/1;
    max-height: 125px;
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
}

.entry button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    width: fit-content;
    height: fit-content;
    margin: .5ch;
}

.entry button svg {
    fill: var(--color-text);
    width: 4ch;
    height: 4ch;
}

.entry button:hover svg {
    fill: var(--color-accent);
}
</style>