<script setup lang="ts">
import SongEntry from "./components/SongEntry.vue";
import Folder from "./components/icons/Folder.vue";

import { ref } from "vue";
let path = ref<String>("");
let songs = ref<Song[]>([]);
let count = ref(0);

let directoryHandle: FileSystemDirectoryHandle | null = null;

async function selectFolder() {
  songs.value = [];
  // @ts-ignore
  directoryHandle = await showDirectoryPicker();

  if (directoryHandle === null) {
    return;
  }
  path.value = directoryHandle.name;
  // query all subdirectories
  // @ts-ignore
  async function fetchCover(fileHandle: FileSystemFileHandle): string {
    try {
      let cover = await fileHandle.getFile();
      let coverBlob = new Blob([cover], { type: "image/png" });
      return await URL.createObjectURL(coverBlob);
    } catch (e) {
      console.log(fileHandle.name + " is not a cover image");

      console.log(e);
      return "";
    }
  }

  function directoryToSong(id: string, cover: string, data: any): Song {
    let difficulty = (data._difficultyBeatmapSets[0]._difficultyBeatmaps) ? data._difficultyBeatmapSets[0]._difficultyBeatmaps.map((d: any) => {
      return {
        name: (d._customData?._difficultyLabel) ? d._customData._difficultyLabel : d._difficulty,
        requirements: (d._customData?._requirements) ? d._customData._requirements : []
      }
    }) : [];
    return {
      id,
      name: (data._songName) ? data._songName : "Unknown",
      songAuthor: (data._songAuthorName) ? data._songAuthorName : "Unknown",
      levelAuthor: (data._levelAuthorName) ? data._levelAuthorName : "Unknown",
      albumCover: cover,
      duration: (data._songDuration) ? data._songDuration : 0,
      beatsPerMinute: (data._beatsPerMinute) ? data._beatsPerMinute : 0,
      difficulty
    };
  }
  // @ts-ignore
  for await (let entry of directoryHandle.values() as FileSystemDirectoryHandle[]) {
    if (entry.kind === "directory") {
      // get info.dat file
      if (await entry.getFileHandle("info.dat").then(() => true, () => false) === false) {
        console.log("no info.dat file in " + entry.name);

        continue;
      }
      let infoFile = await entry.getFileHandle("info.dat");
      // read info.dat file
      let file = await infoFile.getFile();
      let text = await file.text();
      // parse info.dat file
      let song = JSON.parse(text);
      // read cover image
      console.log("fetching cover for " + entry.name);

      let cover = await fetchCover(await entry.getFileHandle(song._coverImageFilename));
      console.log("cover: " + cover);
      let i = directoryToSong(entry.name, cover, song);
      console.log(i);

      songs.value.push(i)
    }
  }
  count.value = songs.value.length;
}

function deleteSong(song: string) {
  if (directoryHandle === null) {
    return;
  }
  console.log("delete song: " + song);
  // delete folder

  directoryHandle.removeEntry(song, { recursive: true });
  // remove from list
  songs.value = songs.value.filter((s) => s.id !== song);
  count.value = songs.value.length;
}


</script>

<template>
  <div class="skeleton">

    <header>
      <h1>Song manager</h1>
      <div class="folder">
        <p v-text="path"></p>
        <button class="folderSelect" v-on:click="selectFolder()">
          <Folder />
        </button>
      </div>
    </header>

    <main>
      <div v-if="directoryHandle != null">

        <h2>Songs: {{ count }}</h2>
        <ul class="songList" v-if="songs.length >= 1">
          <li v-for="song in songs" :key="song.name" class="songEntry">
            <SongEntry :song="song" v-on:delete="deleteSong" />
          </li>
        </ul>
        <p v-else>No songs found</p>
      </div>
      <div class="bigButton" v-else>
        <p>Select a folder</p>
        <button v-on:click="selectFolder()">

          <Folder />
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.skeleton {
  display: grid;
  grid-template-rows: fit-content(1em) 1fr;
  max-width: 100%;
  padding: 1ch;
  height: 100%;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.songList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1em;
  padding: 1ch;
}

li {
  list-style: none;
}

.folder {
  display: flex;
  gap: 1em;
  padding-right: 1ch;
}

.folderSelect {
  background-color: transparent;
  border: none;
  cursor: pointer;
  width: fit-content;
  height: fit-content;
  padding: .5ch;

  display: flex;
  align-items: center;
  justify-content: center;
}

.folderSelect svg {
  width: 2em;
  height: 2em;
  fill: var(--color-text);
}

.bigButton {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4em;
  padding: 1ch;
  border: none;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.bigButton button {
  background-color: transparent;
  border: none;
}

.bigButton svg {
  aspect-ratio: 1/1;
  width: 100%;
  fill: var(--color-text);
}

.bigButton p {
  font-size: xx-large;
}

button:hover svg {
  fill: var(--color-accent);
}
</style>
