var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/server/lyricsDatabase.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
function normalizeForSearch(str) {
  if (!str) return "";
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/(\(|\[)(official\s*(music\s*)?(video|audio|lyrics|hd|4k|remastered|lyric\s*video|visualizer)|remastered\s*\d*).*?(\)|\])/gi, "").replace(/\s*-\s*(official\s*(music\s*)?(video|audio|lyrics)|visualizer)/gi, "").replace(/\s+(ft\.|feat\.|featuring)\s+.*/gi, "").replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "").trim();
}
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "lyrics_database.json");
var INITIAL_SEED_LYRICS = [
  {
    id: "eshu_nepali_sajjan_hataarindai",
    title: "Hataarindai Bataasindai",
    artist: "Sajjan Raj Vaidya",
    album: "Single",
    language: "Nepali",
    plainLyrics: `\u0939\u0924\u093E\u0930\u093F\u0901\u0926\u0948 \u092C\u0924\u093E\u0938\u093F\u0901\u0926\u0948
\u0915\u0939\u093E\u0901 \u091C\u093E\u0928 \u0932\u093E\u0917\u0947\u0915\u094B \u0924\u093F\u092E\u0940?
\u0928\u0930\u094B\u0915\u093F\u0928\u0947 \u0938\u092E\u092F \u091C\u0938\u094D\u0924\u0948
\u0915\u0939\u093E\u0901 \u0909\u0921\u094D\u0928 \u0932\u093E\u0917\u0947\u0915\u094B \u0924\u093F\u092E\u0940?

\u092F\u0939\u093E\u0901 \u090F\u0915\u0948 \u091B\u093F\u0928 \u092C\u0938 \u0928
\u092E\u0947\u0930\u094B \u0939\u093E\u0924 \u0938\u092E\u093E\u090F\u0930
\u092E\u0932\u093E\u0908 \u0939\u0947\u0930 \u0928 \u0924\u093F\u092E\u094D\u0930\u094B \u0906\u0901\u0916\u093E\u0932\u0947
\u0924\u093F\u092E\u094D\u0930\u094B \u0924\u094D\u092F\u094B \u0928\u094D\u092F\u093E\u0928\u094B \u092E\u093E\u092F\u093E\u0932\u0947

\u0924\u093F\u092E\u0940 \u091C\u0939\u093E\u0901 \u0917\u090F \u092A\u0928\u093F
\u092E\u0947\u0930\u094B \u092E\u0941\u091F\u0941 \u0924\u093F\u092E\u094D\u0930\u0948 \u0938\u093E\u0925 \u091B
\u092F\u094B \u0938\u0902\u0938\u093E\u0930\u0915\u094B \u091C\u0941\u0928\u0938\u0941\u0915\u0948 \u0915\u0941\u0928\u093E\u092E\u093E
\u0939\u093E\u092E\u094D\u0930\u094B \u092E\u093E\u092F\u093E \u091C\u0940\u0935\u093F\u0924 \u0930\u0939\u0928\u094D\u091B`,
    syncedLyrics: `[00:00.00]\u266A \u0939\u0924\u093E\u0930\u093F\u0901\u0926\u0948 \u092C\u0924\u093E\u0938\u093F\u0901\u0926\u0948 - \u0938\u091C\u094D\u091C\u0928 \u0930\u093E\u091C \u0935\u0948\u0926\u094D\u092F \u266A
[00:10.50]\u0939\u0924\u093E\u0930\u093F\u0901\u0926\u0948 \u092C\u0924\u093E\u0938\u093F\u0901\u0926\u0948
[00:16.80]\u0915\u0939\u093E\u0901 \u091C\u093E\u0928 \u0932\u093E\u0917\u0947\u0915\u094B \u0924\u093F\u092E\u0940?
[00:23.20]\u0928\u0930\u094B\u0915\u093F\u0928\u0947 \u0938\u092E\u092F \u091C\u0938\u094D\u0924\u0948
[00:29.40]\u0915\u0939\u093E\u0901 \u0909\u0921\u094D\u0928 \u0932\u093E\u0917\u0947\u0915\u094B \u0924\u093F\u092E\u0940?
[00:36.00]\u092F\u0939\u093E\u0901 \u090F\u0915\u0948 \u091B\u093F\u0928 \u092C\u0938 \u0928
[00:42.50]\u092E\u0947\u0930\u094B \u0939\u093E\u0924 \u0938\u092E\u093E\u090F\u0930
[00:49.00]\u092E\u0932\u093E\u0908 \u0939\u0947\u0930 \u0928 \u0924\u093F\u092E\u094D\u0930\u094B \u0906\u0901\u0916\u093E\u0932\u0947
[00:55.20]\u0924\u093F\u092E\u094D\u0930\u094B \u0924\u094D\u092F\u094B \u0928\u094D\u092F\u093E\u0928\u094B \u092E\u093E\u092F\u093E\u0932\u0947
[01:03.00]\u0924\u093F\u092E\u0940 \u091C\u0939\u093E\u0901 \u0917\u090F \u092A\u0928\u093F
[01:09.50]\u092E\u0947\u0930\u094B \u092E\u0941\u091F\u0941 \u0924\u093F\u092E\u094D\u0930\u0948 \u0938\u093E\u0925 \u091B
[01:16.00]\u092F\u094B \u0938\u0902\u0938\u093E\u0930\u0915\u094B \u091C\u0941\u0928\u0938\u0941\u0915\u0948 \u0915\u0941\u0928\u093E\u092E\u093E
[01:23.40]\u0939\u093E\u092E\u094D\u0930\u094B \u092E\u093E\u092F\u093E \u091C\u0940\u0935\u093F\u0924 \u0930\u0939\u0928\u094D\u091B
[01:32.00]\u266A Instrumental Melodic Interlude \u266A
[01:45.00]\u0939\u0924\u093E\u0930\u093F\u0901\u0926\u0948 \u092C\u0924\u093E\u0938\u093F\u0901\u0926\u0948
[01:52.00]\u0915\u0939\u093E\u0901 \u091C\u093E\u0928 \u0932\u093E\u0917\u0947\u0915\u094B \u0924\u093F\u092E\u0940?`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_nepali_sajjan_dhawankh",
    title: "Dhawankh (\u0922\u0941\u0919\u094D\u0917\u093E\u0915\u094B \u092E\u0941\u091F\u0941)",
    artist: "Sajjan Raj Vaidya",
    album: "Dhawankh",
    language: "Nepali",
    plainLyrics: `\u092E \u0924 \u0915\u093E\u0932\u094B \u0915\u093E\u0917 \u091D\u0948\u0902 \u0909\u0921\u094D\u0926\u0948 \u091B\u0941
\u0924\u093F\u092E\u094D\u0930\u094B \u0938\u092E\u094D\u091D\u0928\u093E\u0915\u094B \u0906\u0915\u093E\u0936\u092E\u093E
\u0922\u0941\u0919\u094D\u0917\u093E\u0915\u094B \u092E\u0941\u091F\u0941 \u092C\u094B\u0915\u0947\u0930 \u0939\u093F\u0901\u0921\u094D\u0926\u0948 \u091B\u0941
\u092F\u094B \u0935\u093F\u0930\u093E\u0928\u094B \u0938\u0921\u0915\u092E\u093E

\u0924\u093F\u092E\u0940 \u092B\u0942\u0932 \u091D\u0948\u0902 \u092B\u0941\u0932\u0947\u0915\u0940 \u091B\u094C
\u0915\u0938\u0948\u0915\u094B \u0906\u0901\u0917\u0928\u092E\u093E
\u092E \u0915\u093E\u0901\u0921\u093E \u091D\u0948\u0902 \u092C\u093F\u091D\u093F\u0930\u0939\u0947\u091B\u0941
\u0906\u092B\u094D\u0928\u0948 \u0915\u0932\u094D\u092A\u0928\u093E\u092E\u093E`,
    syncedLyrics: `[00:00.00]\u266A Dhawankh - Sajjan Raj Vaidya \u266A
[00:14.20]\u092E \u0924 \u0915\u093E\u0932\u094B \u0915\u093E\u0917 \u091D\u0948\u0902 \u0909\u0921\u094D\u0926\u0948 \u091B\u0941
[00:22.50]\u0924\u093F\u092E\u094D\u0930\u094B \u0938\u092E\u094D\u091D\u0928\u093E\u0915\u094B \u0906\u0915\u093E\u0936\u092E\u093E
[00:31.00]\u0922\u0941\u0919\u094D\u0917\u093E\u0915\u094B \u092E\u0941\u091F\u0941 \u092C\u094B\u0915\u0947\u0930 \u0939\u093F\u0901\u0921\u094D\u0926\u0948 \u091B\u0941
[00:39.50]\u092F\u094B \u0935\u093F\u0930\u093E\u0928\u094B \u0938\u0921\u0915\u092E\u093E
[00:48.00]\u0924\u093F\u092E\u0940 \u092B\u0942\u0932 \u091D\u0948\u0902 \u092B\u0941\u0932\u0947\u0915\u0940 \u091B\u094C
[00:56.50]\u0915\u0938\u0948\u0915\u094B \u0906\u0901\u0917\u0928\u092E\u093E
[01:05.00]\u092E \u0915\u093E\u0901\u0921\u093E \u091D\u0948\u0902 \u092C\u093F\u091D\u093F\u0930\u0939\u0947\u091B\u0941
[01:13.50]\u0906\u092B\u094D\u0928\u0948 \u0915\u0932\u094D\u092A\u0928\u093E\u092E\u093E`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_nepali_sushant_aama",
    title: "Aama (\u0906\u092E\u093E)",
    artist: "Sushant KC",
    album: "Single",
    language: "Nepali",
    plainLyrics: `\u0906\u092E\u093E, \u0924\u093F\u092E\u094D\u0930\u094B \u0928\u094D\u092F\u093E\u0928\u094B \u0915\u093E\u0916\u0915\u094B \u092F\u093E\u0926 \u0906\u0909\u0901\u091B
\u092F\u094B \u092A\u0930\u0926\u0947\u0936\u0940 \u092D\u0942\u092E\u093F\u092E\u093E \u090F\u0915\u094D\u0932\u0948 \u0939\u0941\u0901\u0926\u093E
\u0924\u093F\u092E\u094D\u0930\u094B \u0924\u094D\u092F\u094B \u092E\u093E\u092F\u093E\u0932\u0941 \u092C\u094B\u0932\u0940 \u0938\u092E\u094D\u091D\u0928\u093E \u0906\u0909\u0901\u091B
\u0938\u092A\u0928\u093E \u092A\u0942\u0930\u093E \u0917\u0930\u094D\u0928 \u0939\u093F\u0901\u0921\u0947\u0915\u094B \u092E`,
    syncedLyrics: `[00:00.00]\u266A Aama - Sushant KC \u266A
[00:12.00]\u0906\u092E\u093E, \u0924\u093F\u092E\u094D\u0930\u094B \u0928\u094D\u092F\u093E\u0928\u094B \u0915\u093E\u0916\u0915\u094B \u092F\u093E\u0926 \u0906\u0909\u0901\u091B
[00:21.40]\u092F\u094B \u092A\u0930\u0926\u0947\u0936\u0940 \u092D\u0942\u092E\u093F\u092E\u093E \u090F\u0915\u094D\u0932\u0948 \u0939\u0941\u0901\u0926\u093E
[00:30.50]\u0924\u093F\u092E\u094D\u0930\u094B \u0924\u094D\u092F\u094B \u092E\u093E\u092F\u093E\u0932\u0941 \u092C\u094B\u0932\u0940 \u0938\u092E\u094D\u091D\u0928\u093E \u0906\u0909\u0901\u091B
[00:40.00]\u0938\u092A\u0928\u093E \u092A\u0942\u0930\u093E \u0917\u0930\u094D\u0928 \u0939\u093F\u0901\u0921\u0947\u0915\u094B \u092E
[00:49.50]\u0906\u092E\u093E, \u092E \u092B\u0930\u094D\u0915\u093F \u0906\u0909\u0928\u0947\u091B\u0941 \u0924\u093F\u092E\u094D\u0930\u094B \u092E\u0941\u0939\u093E\u0930\u092E\u093E \u0939\u093E\u0901\u0938\u094B \u0932\u093F\u090F\u0930`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_nepali_sushant_gulabi",
    title: "Gulabi (\u0917\u0941\u0932\u093E\u092C\u0940)",
    artist: "Sushant KC",
    album: "Single",
    language: "Nepali",
    plainLyrics: `\u0924\u093F\u092E\u094D\u0930\u094B \u0924\u094D\u092F\u094B \u0917\u0941\u0932\u093E\u092C\u0940 \u0906\u0901\u0916\u093E\u0932\u0947
\u092E\u0932\u093E\u0908 \u0939\u0947\u0930\u093F\u0926\u0947\u090A \u0928 \u090F\u0915\u092A\u0932\u094D\u091F
\u0924\u093F\u092E\u094D\u0930\u094B \u0924\u094D\u092F\u094B \u092E\u093F\u0920\u094B \u092E\u0941\u0938\u094D\u0915\u093E\u0928\u0932\u0947
\u092E\u0928\u0948 \u0932\u094B\u092D\u094D\u092F\u093E\u092F\u094B \u0905\u091A\u093E\u0928\u0915`,
    syncedLyrics: `[00:00.00]\u266A Gulabi - Sushant KC \u266A
[00:11.50]\u0924\u093F\u092E\u094D\u0930\u094B \u0924\u094D\u092F\u094B \u0917\u0941\u0932\u093E\u092C\u0940 \u0906\u0901\u0916\u093E\u0932\u0947
[00:19.00]\u092E\u0932\u093E\u0908 \u0939\u0947\u0930\u093F\u0926\u0947\u090A \u0928 \u090F\u0915\u092A\u0932\u094D\u091F
[00:26.50]\u0924\u093F\u092E\u094D\u0930\u094B \u0924\u094D\u092F\u094B \u092E\u093F\u0920\u094B \u092E\u0941\u0938\u094D\u0915\u093E\u0928\u0932\u0947
[00:34.00]\u092E\u0928\u0948 \u0932\u094B\u092D\u094D\u092F\u093E\u092F\u094B \u0905\u091A\u093E\u0928\u0915
[00:41.50]\u0917\u0941\u0932\u093E\u092C\u0940 \u0924\u093F\u092E\u094D\u0930\u094B \u0917\u093E\u0932\u093E... \u092E\u0928 \u092E\u0947\u0930\u094B \u0909\u0921\u094D\u092F\u094B \u092C\u093E\u0926\u0932 \u092A\u093E\u0930\u0940`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_nepali_tribalrain_bhanai",
    title: "Bhanai (\u092D\u0928\u093E\u0908)",
    artist: "Tribal Rain",
    album: "Roka Yo Samay",
    language: "Nepali",
    plainLyrics: `\u0915\u0947 \u092D\u0928\u094D\u0928\u0941 \u0930 \u0916\u0948 \u0924\u093F\u092E\u0940\u0932\u093E\u0908?
\u0936\u092C\u094D\u0926\u0939\u0930\u0941 \u0938\u092C\u0948 \u0939\u0930\u093E\u090F \u091D\u0948\u0902 \u0932\u093E\u0917\u094D\u091B
\u092E\u0928\u0915\u094B \u0915\u0941\u0930\u093E \u092E\u0928\u092E\u0948 \u0930\u0939\u094D\u092F\u094B
\u092C\u0924\u093E\u0938\u0938\u0901\u0917\u0948 \u092C\u0917\u0947\u0930 \u0917\u092F\u094B

\u0930\u094B\u0915 \u092F\u094B \u0938\u092E\u092F\u0932\u093E\u0908 \u090F\u0915\u0948 \u091B\u093F\u0928
\u092E \u0924\u093F\u092E\u0940\u0932\u093E\u0908 \u0939\u0947\u0930\u093F\u0930\u0939\u0941\u0901
\u091C\u093F\u0928\u094D\u0926\u0917\u0940\u0915\u094B \u092F\u094B \u092F\u093E\u0924\u094D\u0930\u093E\u092E\u093E
\u0924\u093F\u092E\u094D\u0930\u0948 \u0938\u093E\u0925 \u0939\u093F\u0901\u0921\u093F\u0930\u0939\u0941\u0901`,
    syncedLyrics: `[00:00.00]\u266A Bhanai - Tribal Rain \u266A
[00:15.00]\u0915\u0947 \u092D\u0928\u094D\u0928\u0941 \u0930 \u0916\u0948 \u0924\u093F\u092E\u0940\u0932\u093E\u0908?
[00:24.00]\u0936\u092C\u094D\u0926\u0939\u0930\u0941 \u0938\u092C\u0948 \u0939\u0930\u093E\u090F \u091D\u0948\u0902 \u0932\u093E\u0917\u094D\u091B
[00:33.50]\u092E\u0928\u0915\u094B \u0915\u0941\u0930\u093E \u092E\u0928\u092E\u0948 \u0930\u0939\u094D\u092F\u094B
[00:42.00]\u092C\u0924\u093E\u0938\u0938\u0901\u0917\u0948 \u092C\u0917\u0947\u0930 \u0917\u092F\u094B
[00:52.00]\u0930\u094B\u0915 \u092F\u094B \u0938\u092E\u092F\u0932\u093E\u0908 \u090F\u0915\u0948 \u091B\u093F\u0928
[01:01.00]\u092E \u0924\u093F\u092E\u0940\u0932\u093E\u0908 \u0939\u0947\u0930\u093F\u0930\u0939\u0941\u0901
[01:10.00]\u091C\u093F\u0928\u094D\u0926\u0917\u0940\u0915\u094B \u092F\u094B \u092F\u093E\u0924\u094D\u0930\u093E\u092E\u093E
[01:19.00]\u0924\u093F\u092E\u094D\u0930\u0948 \u0938\u093E\u0925 \u0939\u093F\u0901\u0921\u093F\u0930\u0939\u0941\u0901`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_nepali_bipul_syndicate",
    title: "Syndicate (\u0938\u093F\u0928\u094D\u0921\u093F\u0915\u0947\u091F)",
    artist: "Bipul Chettri",
    album: "Sketches of Darjeeling",
    language: "Nepali",
    plainLyrics: `\u0924\u093F\u092E\u0940 \u0930 \u092E \u092C\u0938\u094D\u092F\u094C \u0938\u093F\u0928\u094D\u0921\u093F\u0915\u0947\u091F\u0915\u094B \u0917\u093E\u0921\u0940\u092E\u093E
\u091D\u094D\u092F\u093E\u0932\u092C\u093E\u091F \u0926\u0947\u0916\u093F\u0928\u0947 \u0924\u0940 \u0939\u0930\u093F\u092F\u093E \u092A\u0939\u093E\u0921\u092E\u093E
\u0927\u0941\u0935\u093E\u0901 \u0909\u0921\u093E\u0909\u0901\u0926\u0948 \u0917\u092B\u093F\u0901\u0926\u0948 \u0917\u092F\u094C
\u092E\u0928\u0915\u093E \u0915\u0941\u0930\u093E \u0938\u0941\u0928\u093E\u0909\u0901\u0926\u0948 \u0917\u092F\u094C

\u0938\u093F\u0928\u094D\u0921\u093F\u0915\u0947\u091F\u0915\u094B \u092F\u093E\u0924\u094D\u0930\u093E \u0932\u093E\u092E\u094B \u092D\u090F \u092A\u0928\u093F
\u0924\u093F\u092E\u094D\u0930\u094B \u0938\u093E\u0925 \u091B\u094B\u091F\u094B \u0932\u093E\u0917\u094D\u092F\u094B \u0938\u0927\u0948\u0902 \u092D\u0930\u093F`,
    syncedLyrics: `[00:00.00]\u266A Syndicate - Bipul Chettri \u266A
[00:13.50]\u0924\u093F\u092E\u0940 \u0930 \u092E \u092C\u0938\u094D\u092F\u094C \u0938\u093F\u0928\u094D\u0921\u093F\u0915\u0947\u091F\u0915\u094B \u0917\u093E\u0921\u0940\u092E\u093E
[00:22.00]\u091D\u094D\u092F\u093E\u0932\u092C\u093E\u091F \u0926\u0947\u0916\u093F\u0928\u0947 \u0924\u0940 \u0939\u0930\u093F\u092F\u093E \u092A\u0939\u093E\u0921\u092E\u093E
[00:31.00]\u0927\u0941\u0935\u093E\u0901 \u0909\u0921\u093E\u0909\u0901\u0926\u0948 \u0917\u092B\u093F\u0901\u0926\u0948 \u0917\u092F\u094C
[00:40.00]\u092E\u0928\u0915\u093E \u0915\u0941\u0930\u093E \u0938\u0941\u0928\u093E\u0909\u0901\u0926\u0948 \u0917\u092F\u094C
[00:50.00]\u0938\u093F\u0928\u094D\u0921\u093F\u0915\u0947\u091F\u0915\u094B \u092F\u093E\u0924\u094D\u0930\u093E \u0932\u093E\u092E\u094B \u092D\u090F \u092A\u0928\u093F
[00:59.00]\u0924\u093F\u092E\u094D\u0930\u094B \u0938\u093E\u0925 \u091B\u094B\u091F\u094B \u0932\u093E\u0917\u094D\u092F\u094B \u0938\u0927\u0948\u0902 \u092D\u0930\u093F`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_nepali_arthur_nyanoghar",
    title: "Nyano Ghar (\u0928\u094D\u092F\u093E\u0928\u094B \u0918\u0930)",
    artist: "Arthur Gunn (Dibesh Pokharel)",
    album: "Single",
    language: "Nepali",
    plainLyrics: `\u0928\u094D\u092F\u093E\u0928\u094B \u0918\u0930 \u092E\u0947\u0930\u094B \u092A\u0939\u093E\u0921\u0915\u094B \u0915\u093E\u0916\u092E\u093E
\u0938\u092B\u093E \u0939\u093E\u0935\u093E \u091A\u0932\u094D\u0928\u0947 \u0939\u0930\u093F\u092F\u093E\u0932\u0940 \u0921\u093E\u0901\u0921\u093E\u092E\u093E
\u0938\u092E\u094D\u091D\u093F\u0930\u0939\u0928\u094D\u091B\u0941 \u092E \u0924\u094D\u092F\u094B \u0917\u093E\u0909\u0901\u0915\u094B \u0917\u094B\u0930\u0947\u091F\u094B
\u0906\u092E\u093E\u0932\u0947 \u092C\u0928\u093E\u090F\u0915\u094B \u0915\u094B\u0926\u094B\u0915\u094B \u0930\u094B\u091F\u0940 \u0924\u094D\u092F\u094B`,
    syncedLyrics: `[00:00.00]\u266A Nyano Ghar - Arthur Gunn \u266A
[00:12.80]\u0928\u094D\u092F\u093E\u0928\u094B \u0918\u0930 \u092E\u0947\u0930\u094B \u092A\u0939\u093E\u0921\u0915\u094B \u0915\u093E\u0916\u092E\u093E
[00:22.00]\u0938\u092B\u093E \u0939\u093E\u0935\u093E \u091A\u0932\u094D\u0928\u0947 \u0939\u0930\u093F\u092F\u093E\u0932\u0940 \u0921\u093E\u0901\u0921\u093E\u092E\u093E
[00:32.00]\u0938\u092E\u094D\u091D\u093F\u0930\u0939\u0928\u094D\u091B\u0941 \u092E \u0924\u094D\u092F\u094B \u0917\u093E\u0909\u0901\u0915\u094B \u0917\u094B\u0930\u0947\u091F\u094B
[00:41.50]\u0906\u092E\u093E\u0932\u0947 \u092C\u0928\u093E\u090F\u0915\u094B \u0915\u094B\u0926\u094B\u0915\u094B \u0930\u094B\u091F\u0940 \u0924\u094D\u092F\u094B
[00:51.00]\u092B\u0930\u094D\u0915\u093F \u0906\u0909\u0928\u0947\u091B\u0941 \u092E \u0906\u092B\u094D\u0928\u0948 \u092A\u094D\u092F\u093E\u0930\u094B \u0918\u0930\u092E\u093E`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_nepali_oasis_junkeri",
    title: "Junkeri (\u091C\u0941\u0928\u094D\u0915\u0947\u0930\u0940)",
    artist: "Oasis Thapa",
    album: "Single",
    language: "Nepali",
    plainLyrics: `\u091C\u0941\u0928\u094D\u0915\u0947\u0930\u0940 \u091D\u0948\u0902 \u092C\u0932\u094D\u0926\u0948 \u091B\u094C \u0924\u093F\u092E\u0940
\u092E\u0947\u0930\u094B \u092F\u094B \u0905\u0927\u094D\u092F\u093E\u0901\u0930\u094B \u0930\u093E\u0924\u092E\u093E
\u0924\u093E\u0930\u093E \u091D\u0948\u0902 \u091A\u092E\u094D\u0915\u093F\u0930\u0939\u0947\u091B\u094C \u0924\u093F\u092E\u0940
\u092E\u0947\u0930\u094B \u092F\u094B \u0938\u093E\u0928\u094B \u0938\u0902\u0938\u093E\u0930\u092E\u093E

\u092E \u0924\u093F\u092E\u0940\u0932\u093E\u0908 \u0938\u092E\u094D\u091D\u093F\u0930\u0939\u0928\u094D\u091B\u0941
\u0939\u0930\u0947\u0915 \u0927\u0921\u094D\u0915\u0928 \u0930 \u0939\u0930\u0947\u0915 \u0938\u093E\u0938\u0938\u0901\u0917\u0948`,
    syncedLyrics: `[00:00.00]\u266A Junkeri - Oasis Thapa \u266A
[00:14.00]\u091C\u0941\u0928\u094D\u0915\u0947\u0930\u0940 \u091D\u0948\u0902 \u092C\u0932\u094D\u0926\u0948 \u091B\u094C \u0924\u093F\u092E\u0940
[00:23.00]\u092E\u0947\u0930\u094B \u092F\u094B \u0905\u0927\u094D\u092F\u093E\u0901\u0930\u094B \u0930\u093E\u0924\u092E\u093E
[00:32.00]\u0924\u093E\u0930\u093E \u091D\u0948\u0902 \u091A\u092E\u094D\u0915\u093F\u0930\u0939\u0947\u091B\u094C \u0924\u093F\u092E\u0940
[00:41.00]\u092E\u0947\u0930\u094B \u092F\u094B \u0938\u093E\u0928\u094B \u0938\u0902\u0938\u093E\u0930\u092E\u093E
[00:51.00]\u092E \u0924\u093F\u092E\u0940\u0932\u093E\u0908 \u0938\u092E\u094D\u091D\u093F\u0930\u0939\u0928\u094D\u091B\u0941
[01:00.00]\u0939\u0930\u0947\u0915 \u0927\u0921\u094D\u0915\u0928 \u0930 \u0939\u0930\u0947\u0915 \u0938\u093E\u0938\u0938\u0901\u0917\u0948`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_global_queen_bohemian",
    songId: "fJ9rUzIMcZQ",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    language: "English",
    plainLyrics: `Is this the real life? Is this just fantasy?
Caught in a landslide, no escape from reality
Open your eyes, look up to the skies and see
I'm just a poor boy, I need no sympathy
Because I'm easy come, easy go, little high, little low
Any way the wind blows doesn't really matter to me, to me

Mama, just killed a man
Put a gun against his head, pulled my trigger, now he's dead
Mama, life had just begun
But now I've gone and thrown it all away
Mama, ooh, didn't mean to make you cry
If I'm not back again this time tomorrow
Carry on, carry on as if nothing really matters`,
    syncedLyrics: `[00:00.00]\u266A Intro \u266A
[00:03.40]Is this the real life?
[00:07.80]Is this just fantasy?
[00:12.80]Caught in a landslide, no escape from reality
[00:20.80]Open your eyes, look up to the skies and see
[00:30.20]I'm just a poor boy, I need no sympathy
[00:37.20]Because I'm easy come, easy go, little high, little low
[00:45.00]Any way the wind blows doesn't really matter to me, to me
[00:58.50]Mama, just killed a man
[01:05.50]Put a gun against his head, pulled my trigger, now he's dead
[01:13.50]Mama, life had just begun
[01:20.20]But now I've gone and thrown it all away
[01:28.50]Mama, ooh, didn't mean to make you cry
[01:37.80]If I'm not back again this time tomorrow
[01:42.80]Carry on, carry on as if nothing really matters`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_global_weeknd_blindinglights",
    songId: "4NRXx6U8ABQ",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    language: "English",
    plainLyrics: `Yeah
I've been tryna call
I've been on my own for long enough
Maybe you can show me how to love, maybe
I'm going through withdrawals
You don't even have to do too much
You can turn me on with just a touch, baby

I look around and Sin City's cold and empty
No one's around to judge me
I can't see clearly when you're gone

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust`,
    syncedLyrics: `[00:00.00]\u266A Synthesizer Intro \u266A
[00:15.50]Yeah
[00:20.00]I've been tryna call
[00:23.50]I've been on my own for long enough
[00:27.50]Maybe you can show me how to love, maybe
[00:35.00]I'm going through withdrawals
[00:38.50]You don't even have to do too much
[00:43.00]You can turn me on with just a touch, baby
[00:49.50]I look around and Sin City's cold and empty
[00:54.00]No one's around to judge me
[00:57.00]I can't see clearly when you're gone
[01:02.00]I said, ooh, I'm blinded by the lights
[01:08.50]No, I can't sleep until I feel your touch
[01:16.00]I said, ooh, I'm drowning in the night
[01:23.50]Oh, when I'm like this, you're the one I trust`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_global_weeknd_saveyourtears",
    songId: "XXYlFuWEuKI",
    title: "Save Your Tears",
    artist: "The Weeknd",
    album: "After Hours",
    language: "English",
    plainLyrics: `I saw you dancing in a crowded room
You look so happy when I'm not with you
But then you saw me, caught you by surprise
A single teardrop falling from your eye

I don't know why I run away
I'll make you cry when I run away
Take me back 'cause I wanna stay
Save your tears for another day`,
    syncedLyrics: `[00:00.00]\u266A Synth Melody \u266A
[00:10.50]I saw you dancing in a crowded room
[00:16.00]You look so happy when I'm not with you
[00:21.00]But then you saw me, caught you by surprise
[00:26.50]A single teardrop falling from your eye
[00:32.00]I don't know why I run away
[00:42.00]I'll make you cry when I run away
[00:53.00]Take me back 'cause I wanna stay
[00:58.50]Save your tears for another day`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_global_linkin_numb",
    songId: "kXYiU_JCYtU",
    title: "Numb",
    artist: "Linkin Park",
    album: "Meteora",
    language: "English",
    plainLyrics: `I'm tired of being what you want me to be
Feeling so faithless, lost under the surface
Don't know what you're expecting of me
Put under the pressure of walking in your shoes

I've become so numb, I can't feel you there
Become so tired, so much more aware
I'm becoming this, all I want to do
Is be more like me and be less like you`,
    syncedLyrics: `[00:00.00]\u266A Instrumental Intro \u266A
[00:19.50]I'm tired of being what you want me to be
[00:23.00]Feeling so faithless, lost under the surface
[00:26.50]Don't know what you're expecting of me
[00:30.00]Put under the pressure of walking in your shoes
[00:34.00]Every step that I take is another mistake to you
[00:41.50]I've become so numb, I can't feel you there
[00:47.00]Become so tired, so much more aware
[00:53.00]I'm becoming this, all I want to do
[00:58.00]Is be more like me and be less like you`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_global_edsheeran_shapeofyou",
    songId: "JGwWNGJdvx8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "\xF7",
    language: "English",
    plainLyrics: `The club isn't the best place to find a lover
So the bar is where I go
Me and my friends at the table doing shots
Drinking fast and then we talk slow

Girl, you know I want your love
Your love was handmade for somebody like me
Come on now, follow my lead
I may be crazy, don't mind me

I'm in love with the shape of you
We push and pull like a magnet do
Although my heart is falling too
I'm in love with your body`,
    syncedLyrics: `[00:00.00]\u266A Marimba Intro \u266A
[00:09.50]The club isn't the best place to find a lover
[00:11.80]So the bar is where I go
[00:14.20]Me and my friends at the table doing shots
[00:16.80]Drinking fast and then we talk slow
[00:19.00]Come over and start up a conversation with just me
[00:21.80]And trust me I'll give it a chance now
[00:24.00]Girl, you know I want your love
[00:26.50]Your love was handmade for somebody like me
[00:29.00]Come on now, follow my lead
[00:31.50]I'm in love with the shape of you
[00:36.50]We push and pull like a magnet do
[00:41.50]Although my heart is falling too
[00:46.50]I'm in love with your body`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  },
  {
    id: "eshu_hindi_arijit_kesariya",
    songId: "BddP6PYo2gs",
    title: "Kesariya",
    artist: "Arijit Singh, Pritam",
    album: "Brahmastra",
    language: "Hindi",
    plainLyrics: `\u092E\u0941\u091D\u0915\u094B \u0907\u0924\u0928\u093E \u092C\u0924\u093E\u090F \u0915\u094B\u0908
\u0915\u0948\u0938\u0947 \u0924\u0941\u091D\u0938\u0947 \u0926\u093F\u0932 \u0928\u093E \u0932\u0917\u093E\u090F \u0915\u094B\u0908
\u0930\u092C\u094D\u092C\u093E \u0928\u0947 \u0924\u0941\u091D\u0915\u094B \u092C\u0928\u093E\u0928\u0947 \u092E\u0947\u0902
\u0915\u0930 \u0926\u0940 \u0939\u0948 \u0939\u0941\u0938\u094D\u0928 \u0915\u0940 \u0916\u093E\u0932\u0940 \u0924\u093F\u091C\u094B\u0930\u093F\u092F\u093E\u0902

\u0915\u0947\u0938\u0930\u093F\u092F\u093E \u0924\u0947\u0930\u093E \u0907\u0936\u094D\u0915 \u0939\u0948 \u092A\u093F\u092F\u093E
\u0930\u0902\u0917 \u091C\u093E\u090A\u0902 \u091C\u094B \u092E\u0948\u0902 \u0939\u093E\u0925 \u0932\u0917\u093E\u090A\u0902
\u0926\u093F\u0928 \u092C\u0940\u0924\u0947 \u0938\u093E\u0930\u093E \u0924\u0947\u0930\u0940 \u092B\u093F\u0915\u094D\u0930 \u092E\u0947\u0902
\u0930\u0948\u0928 \u0938\u093E\u0930\u0940 \u0924\u0947\u0930\u0940 \u0916\u0948\u0930 \u092E\u0928\u093E\u090A\u0902`,
    syncedLyrics: `[00:00.00]\u266A Kesariya - Arijit Singh \u266A
[00:18.00]\u092E\u0941\u091D\u0915\u094B \u0907\u0924\u0928\u093E \u092C\u0924\u093E\u090F \u0915\u094B\u0908
[00:24.50]\u0915\u0948\u0938\u0947 \u0924\u0941\u091D\u0938\u0947 \u0926\u093F\u0932 \u0928\u093E \u0932\u0917\u093E\u090F \u0915\u094B\u0908
[00:32.00]\u0930\u092C\u094D\u092C\u093E \u0928\u0947 \u0924\u0941\u091D\u0915\u094B \u092C\u0928\u093E\u0928\u0947 \u092E\u0947\u0902
[00:39.00]\u0915\u0930 \u0926\u0940 \u0939\u0948 \u0939\u0941\u0938\u094D\u0928 \u0915\u0940 \u0916\u093E\u0932\u0940 \u0924\u093F\u091C\u094B\u0930\u093F\u092F\u093E\u0902
[00:46.50]\u0915\u0947\u0938\u0930\u093F\u092F\u093E \u0924\u0947\u0930\u093E \u0907\u0936\u094D\u0915 \u0939\u0948 \u092A\u093F\u092F\u093E
[00:53.00]\u0930\u0902\u0917 \u091C\u093E\u090A\u0902 \u091C\u094B \u092E\u0948\u0902 \u0939\u093E\u0925 \u0932\u0917\u093E\u090A\u0902
[01:00.00]\u0926\u093F\u0928 \u092C\u0940\u0924\u0947 \u0938\u093E\u0930\u093E \u0924\u0947\u0930\u0940 \u092B\u093F\u0915\u094D\u0930 \u092E\u0947\u0902
[01:07.50]\u0930\u0948\u0928 \u0938\u093E\u0930\u0940 \u0924\u0947\u0930\u0940 \u0916\u0948\u0930 \u092E\u0928\u093E\u090A\u0902`,
    source: "ESHU Database",
    createdAt: 17e11,
    updatedAt: 17e11
  }
];
var LyricsDatabase = class {
  constructor() {
    this.inMemoryDb = /* @__PURE__ */ new Map();
    this.isLoaded = false;
    this.initDatabase();
  }
  initDatabase() {
    try {
      if (!import_fs.default.existsSync(DATA_DIR)) {
        import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (import_fs.default.existsSync(DB_FILE)) {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const item of parsed) {
            this.inMemoryDb.set(item.id, item);
          }
          for (const seed of INITIAL_SEED_LYRICS) {
            if (!this.inMemoryDb.has(seed.id)) {
              this.inMemoryDb.set(seed.id, seed);
            }
          }
          this.saveToFile();
          this.isLoaded = true;
          return;
        }
      }
      for (const seed of INITIAL_SEED_LYRICS) {
        this.inMemoryDb.set(seed.id, seed);
      }
      this.saveToFile();
      this.isLoaded = true;
    } catch (err) {
      console.warn("LyricsDatabase initialization warning:", err);
      for (const seed of INITIAL_SEED_LYRICS) {
        this.inMemoryDb.set(seed.id, seed);
      }
      this.isLoaded = true;
    }
  }
  saveToFile() {
    try {
      if (!import_fs.default.existsSync(DATA_DIR)) {
        import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
      }
      const records = Array.from(this.inMemoryDb.values());
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), "utf8");
    } catch (err) {
      console.warn("Could not persist lyrics database to file system:", err);
    }
  }
  getAll() {
    return Array.from(this.inMemoryDb.values()).sort((a, b) => {
      const aTime = typeof a.updatedAt === "number" ? a.updatedAt : 0;
      const bTime = typeof b.updatedAt === "number" ? b.updatedAt : 0;
      return bTime - aTime;
    });
  }
  getById(id) {
    return this.inMemoryDb.get(id);
  }
  /**
   * Search lyrics in database by songId, track title, artist
   */
  findMatch(title, artist, songId) {
    const normTitle = normalizeForSearch(title);
    const normArtist = normalizeForSearch(artist);
    if (songId) {
      for (const record of this.inMemoryDb.values()) {
        if (record.songId && record.songId === songId) {
          return record;
        }
      }
    }
    for (const record of this.inMemoryDb.values()) {
      const rTitle = normalizeForSearch(record.title);
      const rArtist = normalizeForSearch(record.artist);
      if (rTitle === normTitle && rArtist === normArtist) {
        return record;
      }
    }
    for (const record of this.inMemoryDb.values()) {
      const rTitle = normalizeForSearch(record.title);
      if (rTitle && normTitle && (rTitle === normTitle || normTitle.includes(rTitle) || rTitle.includes(normTitle))) {
        const rArtist = normalizeForSearch(record.artist);
        if (!normArtist || !rArtist || normArtist.includes(rArtist) || rArtist.includes(normArtist)) {
          return record;
        }
      }
    }
    return null;
  }
  create(record) {
    const id = record.id || `eshu_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    const newRecord = {
      ...record,
      id,
      source: record.source || "ESHU Database",
      createdAt: now,
      updatedAt: now
    };
    this.inMemoryDb.set(id, newRecord);
    this.saveToFile();
    return newRecord;
  }
  update(id, updates) {
    const existing = this.inMemoryDb.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now()
    };
    this.inMemoryDb.set(id, updated);
    this.saveToFile();
    return updated;
  }
  delete(id) {
    const deleted = this.inMemoryDb.delete(id);
    if (deleted) {
      this.saveToFile();
    }
    return deleted;
  }
};
var serverLyricsDb = new LyricsDatabase();

// src/server/lyrics/normalize.ts
var VIDEO_NOISE_PATTERNS = [
  /\b(official\s*(music\s*)?(video|audio|lyrics?(\s*video)?|mv|hd|4k|visualizer))\b/gi,
  /\b(lyric\s*video|lyrics?\s*video)\b/gi,
  /\b(remastered(\s*\d{4})?|remaster)\b/gi,
  /\b(full\s*(song|audio|video|track))\b/gi,
  /\b(new\s*nepali\s*(song|video|movie\s*song)?\s*\d*)\b/gi,
  /\b(nepali\s*(pop|hit|movie|film|modern|folk|lok|adhunik)?\s*(song)?\s*\d*)\b/gi,
  /\b(hd\s*video|4k\s*video|4k\s*ultra\s*hd|1080p)\b/gi,
  /\b(prod\.?\s*by\s*[^)\]|]+)\b/gi,
  /\b(directed\s*by\s*[^)\]|]+)\b/gi,
  /\b(ft\.?|feat\.?|featuring)\s+[a-zA-Z0-9\s,\u0900-\u097F]+/gi,
  /\b(exclusive\s*release|live\s*performance|acoustic\s*version)\b/gi
];
function cleanYouTubeTitle(raw) {
  if (!raw) return "";
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/(\(|\[|\{)\s*(official\s*(music\s*)?(video|audio|lyrics|hd|4k|mv|visualizer)|remastered\s*\d*|full\s*audio|lyric\s*video|hd|4k|new\s*nepali\s*song\s*\d*).*?(\)|\]|\})/gi, "");
  for (const pattern of VIDEO_NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  cleaned = cleaned.replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, "");
  cleaned = cleaned.replace(/\s*[|\-–—:]\s*$/g, "").trim();
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  return cleaned || raw.trim();
}
function cleanArtistName(raw) {
  if (!raw) return "";
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/\s*-\s*Topic$/i, "");
  cleaned = cleaned.replace(/VEVO$/i, "");
  cleaned = cleaned.replace(/\s*-\s*Official(\s*Channel)?$/i, "");
  cleaned = cleaned.replace(/\s+(Official|Channel)$/i, "");
  cleaned = cleaned.replace(/\s+(ft\.?|feat\.?|featuring)\s+.*/gi, "");
  return cleaned.trim() || raw.trim();
}
function parseArtistAndTitle(rawTitle, rawArtist) {
  let title = cleanYouTubeTitle(rawTitle);
  let artist = cleanArtistName(rawArtist);
  const isGenericArtist = !artist || /^(youtube\s*(music|video)?|unknown(\s*artist)?|various\s*artists)$/i.test(artist);
  const dashMatch = title.match(/^(.*?)\s*[-–—:]\s*(.*)$/);
  if (dashMatch) {
    const potentialArtist = dashMatch[1].trim();
    const potentialTitle = dashMatch[2].trim();
    if (isGenericArtist && potentialArtist && potentialTitle) {
      artist = cleanArtistName(potentialArtist);
      title = cleanYouTubeTitle(potentialTitle);
    } else if (potentialTitle && potentialArtist.toLowerCase() === artist.toLowerCase()) {
      title = cleanYouTubeTitle(potentialTitle);
    }
  }
  return { title, artist };
}
function extractTitleVariants(title) {
  const variants = /* @__PURE__ */ new Set();
  const clean = cleanYouTubeTitle(title);
  if (!clean) return [];
  variants.add(clean);
  const bracketMatch = clean.match(/^(.*?)\s*[\(\[\{](.*?)[\)\]\}]\s*$/);
  if (bracketMatch) {
    const main = bracketMatch[1].trim();
    const bracketed = bracketMatch[2].trim();
    if (main) variants.add(main);
    if (bracketed) variants.add(bracketed);
  }
  const splitMatch = clean.split(/\s*[|\/–—]\s*/);
  if (splitMatch.length > 1) {
    for (const part of splitMatch) {
      const p = part.trim();
      if (p.length > 1) variants.add(p);
    }
  }
  return Array.from(variants);
}
function normalizeForSearch2(str) {
  if (!str) return "";
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/(\(|\[)(official\s*(music\s*)?(video|audio|lyrics|hd|4k|remastered|lyric\s*video|visualizer)|remastered\s*\d*).*?(\)|\])/gi, "").replace(/\s*-\s*(official\s*(music\s*)?(video|audio|lyrics)|visualizer)/gi, "").replace(/\s+(ft\.|feat\.|featuring)\s+.*/gi, "").replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "").trim();
}

// src/server/lyrics/providers/EshuDbProvider.ts
var EshuDbProvider = class {
  constructor() {
    this.name = "ESHU Database";
  }
  async getLyrics(query) {
    const { title: rawTitle, artist: rawArtist, videoId } = query;
    const { title, artist } = parseArtistAndTitle(rawTitle, rawArtist || "");
    if (videoId) {
      const match = serverLyricsDb.findMatch(title, artist, videoId);
      if (match && (match.syncedLyrics || match.plainLyrics)) {
        return {
          id: match.id,
          songId: match.songId || videoId,
          synced: Boolean(match.syncedLyrics && match.syncedLyrics.trim().length > 0),
          syncedLyrics: match.syncedLyrics,
          plainLyrics: match.plainLyrics,
          trackName: match.title,
          artistName: match.artist,
          album: match.album,
          language: match.language,
          source: match.source || "ESHU Database",
          isCustom: true
        };
      }
    }
    const titleVariants = extractTitleVariants(title);
    for (const variant of titleVariants) {
      const match = serverLyricsDb.findMatch(variant, artist, videoId);
      if (match && (match.syncedLyrics || match.plainLyrics)) {
        return {
          id: match.id,
          songId: match.songId || videoId,
          synced: Boolean(match.syncedLyrics && match.syncedLyrics.trim().length > 0),
          syncedLyrics: match.syncedLyrics,
          plainLyrics: match.plainLyrics,
          trackName: match.title,
          artistName: match.artist,
          album: match.album,
          language: match.language,
          source: match.source || "ESHU Database",
          isCustom: true
        };
      }
    }
    return null;
  }
};

// src/server/lyrics/providers/LrclibProvider.ts
var LRCLIB_HEADERS = {
  "User-Agent": "EshuMusic/2.0 (https://github.com/eshu-music-player; contact@eshu-music.app)",
  "Accept": "application/json"
};
var REQUEST_TIMEOUT_MS = 6e3;
var LrclibProvider = class {
  constructor() {
    this.name = "LRCLIB";
  }
  async getLyrics(query) {
    const { title: rawTitle, artist: rawArtist, duration } = query;
    const { title, artist } = parseArtistAndTitle(rawTitle, rawArtist || "");
    const titleVariants = extractTitleVariants(title);
    for (const tVar of titleVariants) {
      const exactMatch = await this.tryExactGet(tVar, artist, duration);
      if (exactMatch) return exactMatch;
      if (artist) {
        const exactNoArtist = await this.tryExactGet(tVar, "", duration);
        if (exactNoArtist) return exactNoArtist;
      }
    }
    const searchQueries = [];
    if (artist && title) {
      searchQueries.push(`${title} ${artist}`);
    }
    for (const tVar of titleVariants) {
      searchQueries.push(tVar);
    }
    for (const q of searchQueries) {
      if (!q.trim()) continue;
      const searchMatch = await this.trySearch(q.trim(), title, artist, duration);
      if (searchMatch) return searchMatch;
    }
    return null;
  }
  async fetchWithTimeout(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: LRCLIB_HEADERS,
        signal: controller.signal
      });
      clearTimeout(timer);
      return res;
    } catch {
      clearTimeout(timer);
      return null;
    }
  }
  async tryExactGet(trackName, artistName, duration) {
    try {
      if (duration && duration > 0) {
        const params = new URLSearchParams({
          track_name: trackName
        });
        if (artistName) params.append("artist_name", artistName);
        params.append("duration", Math.round(duration).toString());
        const res = await this.fetchWithTimeout(`https://lrclib.net/api/get?${params.toString()}`);
        if (res && res.ok) {
          const data = await res.json();
          if (data && (data.syncedLyrics || data.plainLyrics)) {
            return this.formatResult(data, trackName, artistName);
          }
        }
      }
      const paramsNoDur = new URLSearchParams({
        track_name: trackName
      });
      if (artistName) paramsNoDur.append("artist_name", artistName);
      const res2 = await this.fetchWithTimeout(`https://lrclib.net/api/get?${paramsNoDur.toString()}`);
      if (res2 && res2.ok) {
        const data = await res2.json();
        if (data && (data.syncedLyrics || data.plainLyrics)) {
          return this.formatResult(data, trackName, artistName);
        }
      }
    } catch (err) {
    }
    return null;
  }
  async trySearch(queryStr, originalTitle, originalArtist, expectedDuration) {
    try {
      const url = `https://lrclib.net/api/search?q=${encodeURIComponent(queryStr)}`;
      const res = await this.fetchWithTimeout(url);
      if (!res || !res.ok) return null;
      const results = await res.json();
      if (!Array.isArray(results) || results.length === 0) return null;
      const normOrigTitle = normalizeForSearch2(originalTitle);
      const normOrigArtist = originalArtist ? normalizeForSearch2(originalArtist) : "";
      const scored = results.filter((r) => r && (r.syncedLyrics || r.plainLyrics)).map((item) => {
        let score = 0;
        const rTrack = normalizeForSearch2(item.trackName || "");
        const rArtist = normalizeForSearch2(item.artistName || "");
        if (item.syncedLyrics) score += 15;
        if (rTrack === normOrigTitle) {
          score += 40;
        } else if (rTrack.includes(normOrigTitle) || normOrigTitle.includes(rTrack)) {
          score += 25;
        }
        if (normOrigArtist && rArtist) {
          if (rArtist === normOrigArtist) {
            score += 30;
          } else if (rArtist.includes(normOrigArtist) || normOrigArtist.includes(rArtist)) {
            score += 15;
          }
        }
        if (expectedDuration && item.duration) {
          const diff = Math.abs(expectedDuration - item.duration);
          if (diff <= 5) score += 20;
          else if (diff <= 15) score += 10;
          else if (diff > 35) score -= 30;
        }
        return { item, score };
      }).filter(({ score }) => score >= 20).sort((a, b) => b.score - a.score);
      if (scored.length > 0) {
        const best = scored[0].item;
        return this.formatResult(best, originalTitle, originalArtist);
      }
    } catch {
    }
    return null;
  }
  formatResult(data, fallbackTitle, fallbackArtist) {
    return {
      synced: Boolean(data.syncedLyrics && data.syncedLyrics.trim().length > 0),
      syncedLyrics: data.syncedLyrics || void 0,
      plainLyrics: data.plainLyrics || void 0,
      trackName: data.trackName || fallbackTitle,
      artistName: data.artistName || fallbackArtist,
      album: data.albumName,
      source: "LRCLIB"
    };
  }
};

// src/server/lyrics/LyricsPipeline.ts
var LyricsPipeline = class {
  // 1 hour
  constructor() {
    this.serverCache = /* @__PURE__ */ new Map();
    this.CACHE_TTL_MS = 1e3 * 60 * 60;
    this.providers = [
      new EshuDbProvider(),
      new LrclibProvider()
    ];
  }
  getCacheKey(query) {
    if (query.videoId) {
      return `yt_${query.videoId}`;
    }
    const normTitle = normalizeForSearch2(query.title);
    const normArtist = normalizeForSearch2(query.artist || "");
    return `meta_${normTitle}_${normArtist}`;
  }
  async resolveLyrics(query) {
    const { title: rawTitle, artist: rawArtist } = query;
    const { title, artist } = parseArtistAndTitle(rawTitle, rawArtist || "");
    const cleanQuery = {
      ...query,
      title,
      artist
    };
    const cacheKey = this.getCacheKey(cleanQuery);
    const cached = this.serverCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      if (cached.result) {
        return cached.result;
      }
      return {
        synced: false,
        unavailable: true,
        source: "None",
        trackName: title,
        artistName: artist
      };
    }
    for (const provider of this.providers) {
      try {
        const result = await provider.getLyrics(cleanQuery);
        if (result && (result.syncedLyrics || result.plainLyrics)) {
          this.serverCache.set(cacheKey, { result, timestamp: Date.now() });
          return result;
        }
      } catch (err) {
        console.warn(`[LyricsPipeline] Provider ${provider.name} error:`, err);
      }
    }
    const unavailableResult = {
      synced: false,
      unavailable: true,
      source: "None",
      trackName: title,
      artistName: artist
    };
    this.serverCache.set(cacheKey, { result: null, timestamp: Date.now() - (this.CACHE_TTL_MS - 3e5) });
    return unavailableResult;
  }
  clearCache(title, artist, videoId) {
    if (videoId) {
      this.serverCache.delete(`yt_${videoId}`);
    }
    const normTitle = normalizeForSearch2(title);
    const normArtist = normalizeForSearch2(artist || "");
    this.serverCache.delete(`meta_${normTitle}_${normArtist}`);
  }
};
var serverLyricsPipeline = new LyricsPipeline();

// server.ts
function parseDuration(durationStr) {
  if (!durationStr) return 210;
  const parts = durationStr.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 210;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 210;
}
function extractYouTubeInfo(input) {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { videoId: trimmed };
  }
  const playlistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  const playlistId = playlistMatch ? playlistMatch[1] : void 0;
  const videoMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i
  );
  const videoId = videoMatch ? videoMatch[1] : void 0;
  return { videoId, playlistId };
}
async function fetchOEmbedMetadata(videoId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5e3);
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      let cleanTitle = data.title || "YouTube Track";
      let cleanArtist = data.author_name || "YouTube Music";
      if (cleanTitle.includes(" - ")) {
        const parts = cleanTitle.split(" - ");
        cleanArtist = parts[0].trim();
        cleanTitle = parts.slice(1).join(" - ").trim();
      }
      return {
        id: videoId,
        title: cleanTitle,
        artist: cleanArtist,
        duration: 210,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`
      };
    }
  } catch (err) {
    clearTimeout(timer);
  }
  return null;
}
var YOUTUBE_CLIENT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+999; SOCS=CAESEwgDEgk2MTQ1NzU1NDQaAmVuIAEaBgiA_LyaBg;"
};
async function searchViaInnertube(query) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6500);
  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/search", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...YOUTUBE_CLIENT_HEADERS
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240313.01.00",
            hl: "en",
            gl: "US"
          }
        },
        query
      })
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const results = [];
    for (const section of sections) {
      const items = section?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          const videoId = v.videoId;
          if (!videoId) continue;
          let title = v.title?.runs?.[0]?.text || v.title?.simpleText || "Unknown Track";
          let artist = v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || "YouTube Music";
          const durationStr = v.lengthText?.simpleText || v.lengthText?.runs?.[0]?.text;
          const duration = parseDuration(durationStr);
          const views = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || "";
          if (title.includes(" - ") && artist.toLowerCase().includes("topic")) {
            const split = title.split(" - ");
            artist = split[0].trim();
            title = split.slice(1).join(" - ").trim();
          }
          results.push({
            id: videoId,
            title,
            artist,
            duration,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            views,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`
          });
          if (results.length >= 25) break;
        }
      }
      if (results.length >= 25) break;
    }
    return results;
  } catch {
    clearTimeout(timer);
    return [];
  }
}
async function searchViaHtmlScrape(query) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6e3);
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`;
    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: YOUTUBE_CLIENT_HEADERS
    });
    clearTimeout(timer);
    if (!response.ok) return [];
    const html = await response.text();
    const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/window\["ytInitialData"\] = ({.*?});<\/script>/s);
    if (!dataMatch || !dataMatch[1]) return [];
    const parsed = JSON.parse(dataMatch[1]);
    const sections = parsed?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const results = [];
    for (const section of sections) {
      const items = section?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          const videoId = v.videoId;
          if (!videoId) continue;
          let title = v.title?.runs?.[0]?.text || v.title?.simpleText || "Unknown Track";
          let artist = v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || "YouTube Music";
          const durationStr = v.lengthText?.simpleText || v.lengthText?.runs?.[0]?.text;
          const duration = parseDuration(durationStr);
          const views = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || "";
          if (title.includes(" - ") && artist.toLowerCase().includes("topic")) {
            const split = title.split(" - ");
            artist = split[0].trim();
            title = split.slice(1).join(" - ").trim();
          }
          results.push({
            id: videoId,
            title,
            artist,
            duration,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            views,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`
          });
          if (results.length >= 25) break;
        }
      }
      if (results.length >= 25) break;
    }
    return results;
  } catch {
    clearTimeout(timer);
    return [];
  }
}
async function scrapeYouTubeSearch(query) {
  try {
    const innertubeResults = await searchViaInnertube(query);
    if (innertubeResults.length > 0) {
      return innertubeResults;
    }
    const htmlResults = await searchViaHtmlScrape(query);
    if (htmlResults.length > 0) {
      return htmlResults;
    }
    return [];
  } catch (err) {
    return [];
  }
}
async function scrapeYouTubePlaylist(playlistId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8e3);
  try {
    const playlistUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}&hl=en`;
    const response = await fetch(playlistUrl, {
      signal: controller.signal,
      headers: YOUTUBE_CLIENT_HEADERS
    });
    clearTimeout(timer);
    if (!response.ok) return { title: "YouTube Playlist", author: "YouTube", thumbnail: "", tracks: [] };
    const html = await response.text();
    const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/window\["ytInitialData"\] = ({.*?});<\/script>/s);
    if (!dataMatch || !dataMatch[1]) return { title: "YouTube Playlist", author: "YouTube", thumbnail: "", tracks: [] };
    const parsed = JSON.parse(dataMatch[1]);
    const header = parsed?.header?.playlistHeaderRenderer || parsed?.sidebar?.playlistSidebarRenderer?.items?.[0]?.playlistSidebarPrimaryInfoRenderer;
    const title = header?.title?.simpleText || header?.title?.runs?.[0]?.text || "Imported YouTube Playlist";
    const author = header?.ownerText?.runs?.[0]?.text || header?.navigationEndpoint?.showCustomThumbnailEndpoint?.title || "YouTube";
    const thumbnail = header?.playlistHeaderBanner?.heroPlaylistThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800`;
    const tabs = parsed?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const secList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    const contents = secList[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents || secList[0]?.itemSectionRenderer?.contents || [];
    const tracks = [];
    for (const item of contents) {
      const v = item.playlistVideoRenderer;
      if (v && v.videoId) {
        let songTitle = v.title?.runs?.[0]?.text || v.title?.simpleText || "Track";
        let artistName = v.shortBylineText?.runs?.[0]?.text || author;
        if (songTitle.includes(" - ") && !artistName.includes(" - ")) {
          const parts = songTitle.split(" - ");
          artistName = parts[0].trim();
          songTitle = parts.slice(1).join(" - ").trim();
        }
        const duration = parseInt(v.lengthSeconds || "210", 10);
        const thumb = v.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;
        tracks.push({
          id: v.videoId,
          title: songTitle,
          artist: artistName.replace(/\s*-\s*Topic$/i, "").trim(),
          album: title,
          duration: isNaN(duration) ? 210 : duration,
          thumbnail: thumb,
          videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`
        });
        continue;
      }
      const l = item.lockupViewModel;
      if (l && l.contentId) {
        const videoId = l.contentId;
        const metaLockup = l.metadata?.lockupMetadataViewModel;
        const label = l.rendererContext?.accessibilityContext?.label || "";
        let songTitle = metaLockup?.title?.content || "";
        const metadataRows = metaLockup?.metadata?.contentMetadataViewModel?.metadataRows || [];
        let artistName = metadataRows[0]?.metadataParts?.[0]?.text?.content || author;
        if (!songTitle && label) {
          const cleanLabel = label.replace(/\s*\d+\s*(?:minutes?|seconds?|hours?)(?:,\s*\d+\s*(?:minutes?|seconds?))?$/i, "").trim();
          songTitle = cleanLabel || "Track";
        }
        if (songTitle.includes(" - ") && (!artistName || artistName === author)) {
          const parts = songTitle.split(" - ");
          artistName = parts[0].trim();
          songTitle = parts.slice(1).join(" - ").trim();
        }
        tracks.push({
          id: videoId,
          title: songTitle || "Track",
          artist: artistName.replace(/\s*-\s*Topic$/i, "").trim() || "YouTube Artist",
          album: title,
          duration: 210,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`
        });
      }
    }
    return {
      title,
      author,
      thumbnail: tracks[0]?.thumbnail || thumbnail,
      tracks
    };
  } catch {
    clearTimeout(timer);
    return { title: "YouTube Playlist", author: "YouTube", thumbnail: "", tracks: [] };
  }
}
async function searchFallbackMusic(query) {
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`;
    const res = await fetch(itunesUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        return data.results.map((item) => ({
          id: `itunes_${item.trackId}`,
          title: item.trackName || "Song",
          artist: item.artistName || "Artist",
          album: item.collectionName,
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1e3) : 210,
          thumbnail: (item.artworkUrl100 || "").replace("100x100bb", "600x600bb"),
          videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.artistName + " " + item.trackName)}`
        }));
      }
    }
  } catch {
  }
  return [];
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "Eshu Music Web Server",
      timestamp: Date.now(),
      uptime: Math.floor(process.uptime())
    });
  });
  app.get(["/health", "/ping"], (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: Date.now()
    });
  });
  app.get("/api/search", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.json({ results: [], query: "" });
    }
    const extracted = extractYouTubeInfo(q);
    if (extracted.videoId) {
      const oembed = await fetchOEmbedMetadata(extracted.videoId);
      if (oembed) {
        return res.json({
          results: [oembed],
          isDirectLink: true,
          videoId: extracted.videoId,
          playlistId: extracted.playlistId
        });
      } else {
        return res.json({
          results: [
            {
              id: extracted.videoId,
              title: `YouTube Track (${extracted.videoId})`,
              artist: "YouTube Video",
              duration: 210,
              thumbnail: `https://img.youtube.com/vi/${extracted.videoId}/hqdefault.jpg`,
              videoUrl: `https://www.youtube.com/watch?v=${extracted.videoId}`
            }
          ],
          isDirectLink: true,
          videoId: extracted.videoId,
          playlistId: extracted.playlistId
        });
      }
    }
    let results = await scrapeYouTubeSearch(q);
    if (results.length === 0) {
      const fallback = await searchFallbackMusic(q);
      results = fallback;
    }
    res.json({
      results,
      query: q,
      count: results.length
    });
  });
  app.get("/api/resolve", async (req, res) => {
    const urlOrId = (req.query.url || req.query.id || "").trim();
    if (!urlOrId) {
      return res.status(400).json({ error: "url or id parameter is required" });
    }
    const { videoId, playlistId } = extractYouTubeInfo(urlOrId);
    if (playlistId && !videoId) {
      return res.json({
        isPlaylist: true,
        playlistId,
        title: "YouTube Playlist"
      });
    }
    if (videoId) {
      const meta = await fetchOEmbedMetadata(videoId);
      return res.json({
        isPlaylist: Boolean(playlistId),
        playlistId,
        track: meta || {
          id: videoId,
          title: `YouTube Video (${videoId})`,
          artist: "YouTube Stream",
          duration: 210,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`
        }
      });
    }
    return res.status(404).json({ error: "Could not resolve YouTube link or video ID" });
  });
  app.get("/api/youtube/playlist", async (req, res) => {
    const raw = (req.query.url || req.query.list || req.query.id || "").trim();
    if (!raw) {
      return res.status(400).json({ error: "url or list parameter is required" });
    }
    const { playlistId } = extractYouTubeInfo(raw);
    const idToUse = playlistId || raw;
    const plData = await scrapeYouTubePlaylist(idToUse);
    if (!plData || plData.tracks.length === 0) {
      return res.status(404).json({ error: "No songs found in this YouTube playlist or playlist is private" });
    }
    res.json({
      id: `yt_${idToUse}`,
      title: plData.title,
      author: plData.author,
      thumbnail: plData.thumbnail,
      tracks: plData.tracks,
      trackCount: plData.tracks.length
    });
  });
  app.get("/api/search/suggestions", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.json({ suggestions: [] });
    }
    try {
      const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`;
      const response = await fetch(suggestUrl);
      const data = await response.json();
      const suggestions = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
      res.json({ suggestions });
    } catch {
      res.json({ suggestions: [] });
    }
  });
  app.get("/api/lyrics", async (req, res) => {
    const rawTrack = (req.query.track_name || req.query.title || "").trim();
    const rawArtist = (req.query.artist_name || req.query.artist || "").trim();
    const songId = (req.query.song_id || req.query.songId || req.query.id || "").trim();
    const duration = req.query.duration ? parseInt(req.query.duration, 10) : void 0;
    if (!rawTrack) {
      return res.status(400).json({ error: "track_name is required" });
    }
    try {
      const result = await serverLyricsPipeline.resolveLyrics({
        title: rawTrack,
        artist: rawArtist,
        duration: isNaN(duration) ? void 0 : duration,
        videoId: songId
      });
      res.json(result);
    } catch (err) {
      console.warn("Lyrics route exception:", err);
      res.json({
        synced: false,
        syncedLyrics: "",
        plainLyrics: "",
        source: "None",
        unavailable: true
      });
    }
  });
  app.get("/api/lyrics/db", (req, res) => {
    try {
      const q = (req.query.q || "").trim().toLowerCase();
      const title = (req.query.title || "").trim();
      const artist = (req.query.artist || "").trim();
      const songId = (req.query.songId || "").trim();
      if (title || artist || songId) {
        const match = serverLyricsDb.findMatch(title, artist, songId);
        return res.json({ records: match ? [match] : [] });
      }
      let all = serverLyricsDb.getAll();
      if (q) {
        all = all.filter(
          (r) => r.title.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q) || r.album && r.album.toLowerCase().includes(q) || r.language && r.language.toLowerCase().includes(q)
        );
      }
      res.json({ records: all, count: all.length });
    } catch (err) {
      console.warn("GET /api/lyrics/db error:", err);
      res.status(500).json({ error: "Failed to retrieve lyrics from database" });
    }
  });
  app.get("/api/lyrics/db/:id", (req, res) => {
    try {
      const record = serverLyricsDb.getById(req.params.id);
      if (!record) {
        return res.status(404).json({ error: "Lyrics record not found" });
      }
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch lyrics record" });
    }
  });
  app.post("/api/lyrics/db", (req, res) => {
    try {
      const { title, artist, album, language, plainLyrics, syncedLyrics, songId, source } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: "Song title is required." });
      }
      if (!artist || !artist.trim()) {
        return res.status(400).json({ error: "Artist name is required." });
      }
      if (!plainLyrics && !syncedLyrics) {
        return res.status(400).json({ error: "Either plainLyrics or syncedLyrics must be provided." });
      }
      const created = serverLyricsDb.create({
        title: title.trim(),
        artist: artist.trim(),
        album: album ? album.trim() : void 0,
        language: language || "Nepali",
        plainLyrics: plainLyrics || (syncedLyrics ? syncedLyrics.replace(/\[\d{2}:\d{2}(\.\d{2,3})?\]/g, "").trim() : ""),
        syncedLyrics: syncedLyrics ? syncedLyrics.trim() : void 0,
        songId: songId ? songId.trim() : void 0,
        source: source || "ESHU Database (Admin)"
      });
      serverLyricsPipeline.clearCache(title.trim(), artist.trim(), songId ? songId.trim() : void 0);
      res.status(201).json(created);
    } catch (err) {
      console.warn("POST /api/lyrics/db error:", err);
      res.status(500).json({ error: err.message || "Failed to save lyrics record." });
    }
  });
  app.put("/api/lyrics/db/:id", (req, res) => {
    try {
      const { title, artist, album, language, plainLyrics, syncedLyrics, songId, source } = req.body;
      const updated = serverLyricsDb.update(req.params.id, {
        ...title && { title: title.trim() },
        ...artist && { artist: artist.trim() },
        ...album !== void 0 && { album: album.trim() },
        ...language && { language },
        ...plainLyrics !== void 0 && { plainLyrics },
        ...syncedLyrics !== void 0 && { syncedLyrics },
        ...songId !== void 0 && { songId },
        ...source && { source }
      });
      if (!updated) {
        return res.status(404).json({ error: "Lyrics record not found to update." });
      }
      serverLyricsPipeline.clearCache(updated.title, updated.artist, updated.songId);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to update lyrics record." });
    }
  });
  app.delete("/api/lyrics/db/:id", (req, res) => {
    try {
      const existing = serverLyricsDb.getById(req.params.id);
      const success = serverLyricsDb.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Lyrics record not found to delete." });
      }
      if (existing) {
        serverLyricsPipeline.clearCache(existing.title, existing.artist, existing.songId);
      }
      res.json({ success: true, message: "Lyrics deleted successfully." });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to delete lyrics record." });
    }
  });
  app.get("/api/sponsorblock", async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) return res.json({ segments: [] });
    try {
      const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=["sponsor","intro","outro","music_offtopic"]`;
      const response = await fetch(url);
      if (response.ok) {
        const segments = await response.json();
        return res.json({ segments });
      }
      res.json({ segments: [] });
    } catch {
      res.json({ segments: [] });
    }
  });
  app.get("/api/dislikes", async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) return res.json({ likes: 0, dislikes: 0, rating: 5 });
    try {
      const url = `https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return res.json({
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
          rating: data.rating || 5,
          viewCount: data.viewCount || 0
        });
      }
      res.json({ likes: 0, dislikes: 0, rating: 5 });
    } catch {
      res.json({ likes: 0, dislikes: 0, rating: 5 });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Eshu Music server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
