<script setup lang="ts">
import { ref } from "vue";
let path = ref("");
let songs = ref([]);
let directoryHandle;
let count = ref(0);
async function selectFolder() {
  songs.value = [];
  directoryHandle = await showDirectoryPicker();
  path.value = directoryHandle.name;
  // query all subdirectories
  for await (let entry of directoryHandle.values()) {
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
      let coverFile = await entry.getFileHandle(song._coverImageFilename).then(async (file) => {
        let cover = await file.getFile();
        let coverBlob = new Blob([cover], { type: "image/png" });
        return URL.createObjectURL(coverBlob);
      });
      songs.value.push({
        name: song._songName,
        cover: coverFile,
        entry: entry.name,
      });
    }
  }
  count.value = songs.value.length;
  console.log(count.value);

}

function deleteSong(song) {
  console.log("delete song: " + song);
  // delete folder
  directoryHandle.removeEntry(song, { recursive: true });
  // remove from list
  songs.value = songs.value.filter((s) => s.entry !== song);
}


</script>

<template>
  <div class="skeleton">

    <header>
      <h1>Song manager</h1>
      <div class="folder">
        <p v-text="path"></p>
        <button v-on:click="selectFolder()">Folder</button>
      </div>
    </header>

    <main>
      <h2>Songs: {{ count }}</h2>
      <ul class="songList">
        <li v-for="song in songs" :key="song.name" class="songEntry" :title="song.entry">
          <img :src="song.cover" />
          <p v-text="song.name"></p>
          <button v-on:click="deleteSong(song.entry)">D</button>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
.skeleton {
  display: grid;
  grid-template-rows: fit-content(1em) 1fr;
  max-width: 100%;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.songList {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1em;
  padding: 1ch;
}

.songEntry {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
  border: 1px solid #ccc;
  padding-left: 1ch;
  padding-right: 1ch;
}

.songEntry img {
  width: 100px;
  height: 100px;
  object-fit: cover;

}

.folder {
  display: flex;
  gap: 1em;
  padding-right: 1ch;
}

main {}
</style>
