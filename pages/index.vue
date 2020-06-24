<template>
  <div>
    <div @click="toggleSound01()">test1</div>
    <div @click="toggleSound02()">test2</div>
    <div @click="toggleSound03()">test3</div>
    <div @click="toggleSound04()">test4</div>
    <div @click="toggleSound05()">test5</div>
    <div @click="toggleSound06()">test6</div>
    <div @click="toggleSound07()">test7</div>
    <div @click="toggleSound08()">test8</div>
    <div @click="toggleSound09()">test9</div>
    <div @click="toggleSound10()">test10</div>
    <div @click="toggleSound11()">test11</div>
    <div @click="toggleSound12()">test12</div>
  </div>
</template>

<script>
import Tone from "tone";
import firebase from "~/plugins/firebase";

export default {
  data: function() {
    return {
      instruments: [
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        },
        {
          player: "",
          isPlaying: false
        }
      ]
    };
  },
  mounted: function() {
    const storageRef = firebase.storage().ref();
    const children = [
      storageRef.child("sounds/nuxt-eno01bass.mp3"),
      storageRef.child("sounds/nuxt-eno02.mp3"),
      storageRef.child("sounds/nuxt-eno03.mp3"),
      storageRef.child("sounds/nuxt-eno04note.mp3"),
      storageRef.child("sounds/nuxt-eno05.mp3"),
      storageRef.child("sounds/nuxt-eno06.mp3"),
      storageRef.child("sounds/nuxt-eno07.mp3"),
      storageRef.child("sounds/nuxt-eno08.mp3"),
      storageRef.child("sounds/nuxt-eno09.mp3"),
      storageRef.child("sounds/nuxt-eno10.mp3"),
      storageRef.child("sounds/nuxt-eno11note.mp3"),
      storageRef.child("sounds/nuxt-eno12.mp3")
    ];

    children.forEach((child, i) => {
      child
        .getDownloadURL()
        .then(url => {
          this.instruments[i].player = new Tone.Player(url).toMaster();
        })
        .catch(error => {
          console.error(error);
        });
    });
  },
  methods: {
    toggleSound01: function() {
      if (this.instruments[0].isPlaying) {
        this.instruments[0].player.stop();
      } else {
        this.instruments[0].player.start();
      }
      this.instruments[0].isPlaying = !this.instruments[0].isPlaying;
    },
    toggleSound02: function() {
      if (this.instruments[1].isPlaying) {
        this.instruments[1].player.stop();
      } else {
        this.instruments[1].player.start();
      }
      this.instruments[1].isPlaying = !this.instruments[1].isPlaying;
    },
    toggleSound03: function() {
      if (this.instruments[2].isPlaying) {
        this.instruments[2].player.stop();
      } else {
        this.instruments[2].player.start();
      }
      this.instruments[2].isPlaying = !this.instruments[2].isPlaying;
    },
    toggleSound04: function() {
      if (this.instruments[3].isPlaying) {
        this.instruments[3].player.stop();
      } else {
        this.instruments[3].player.start();
      }
      this.instruments[3].isPlaying = !this.instruments[3].isPlaying;
    },
    toggleSound05: function() {
      if (this.instruments[4].isPlaying) {
        this.instruments[4].player.stop();
      } else {
        this.instruments[4].player.start();
      }
      this.instruments[4].isPlaying = !this.instruments[4].isPlaying;
    },
    toggleSound06: function() {
      if (this.instruments[5].isPlaying) {
        this.instruments[5].player.stop();
      } else {
        this.instruments[5].player.start();
      }
      this.instruments[5].isPlaying = !this.instruments[5].isPlaying;
    },
    toggleSound07: function() {
      if (this.instruments[6].isPlaying) {
        this.instruments[6].player.stop();
      } else {
        this.instruments[6].player.start();
      }
      this.instruments[6].isPlaying = !this.instruments[6].isPlaying;
    },
    toggleSound08: function() {
      if (this.instruments[7].isPlaying) {
        this.instruments[7].player.stop();
      } else {
        this.instruments[7].player.start();
      }
      this.instruments[7].isPlaying = !this.instruments[7].isPlaying;
    },
    toggleSound09: function() {
      if (this.instruments[8].isPlaying) {
        this.instruments[8].player.stop();
      } else {
        this.instruments[8].player.start();
      }
      this.instruments[8].isPlaying = !this.instruments[8].isPlaying;
    },
    toggleSound10: function() {
      if (this.instruments[9].isPlaying) {
        this.instruments[9].player.stop();
      } else {
        this.instruments[9].player.start();
      }
      this.instruments[9].isPlaying = !this.instruments[9].isPlaying;
    },
    toggleSound11: function() {
      if (this.instruments[10].isPlaying) {
        this.instruments[10].player.stop();
      } else {
        this.instruments[10].player.start();
      }
      this.instruments[10].isPlaying = !this.instruments[10].isPlaying;
    },
    toggleSound12: function() {
      if (this.instruments[11].isPlaying) {
        this.instruments[11].player.stop();
      } else {
        this.instruments[11].player.start();
      }
      this.instruments[11].isPlaying = !this.instruments[11].isPlaying;
    }
  }
};
</script>

<style>
</style>
