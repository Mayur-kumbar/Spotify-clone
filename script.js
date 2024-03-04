let currentSong = new Audio()
let songs;
let currFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {

    currFolder = `${folder}`
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "assets/pause.svg"
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00/00:00"
}

function arrangeLibrary() {

    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + ` <li>
        <div class="songIcon">
            <img src="assets/music.svg" alt="">
        </div>
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div></div>
        </div>
        <div class="songbtn">
            <img src="assets/songplay.svg" alt="">
        </div>
       </li>`
    }


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let array = Array.from(as)
    let cardContainer=document.querySelector(".cardsList")
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder =e.href.split("/").slice(-2)[0]
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML=cardContainer.innerHTML+`  <div data-folder="${folder}" class="card">
            <div class="image">
                <img src="/songs/${folder}/cover.jpg" alt="image">
                <div class="img-btn">
                    <button>
                        <div class="play-button">
                            <span class="play-icon">&#9654;</span>
                        </div>
                    </button>
                </div>
            </div>
            <div class="cardTitle">${response.title}</div>
            <p>${response.description} </p>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

            arrangeLibrary()

        })

    });
    
}

async function main() {

    await getSongs("songs/SleepSongs")
    playMusic(songs[0], true)

    arrangeLibrary()

    currentSong.addEventListener("ended", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        setTimeout(() => {
            if (index + 1 < songs.length) {
                // currentSong.src = "/songs/" + songs[index + 1]
                // currentSong.play()
                playMusic(songs[index+1])
                document.querySelector(".songInfo").innerHTML = decodeURI(songs[index + 1])
            } else {
                currentSong.pause();
                play.src = "assets/play.svg"
            }
        }, 100);
    });
 
    displayAlbums()

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "assets/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 98 + "%"

    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = ((e.offsetX / e.target.getBoundingClientRect().width) * 99)
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector("#previous").addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    document.querySelector("#next").addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%"
    })

    document.querySelector(".volume").addEventListener("change", (e) => {
        currentSong.volume = (e.target.value) / 100
        if (e.target.value == 0) {
            volume.src = "assets/mute.svg"
        }
        else {
            volume.src = "assets/volume.svg"
        }
    })

    document.querySelector("#volume").addEventListener("click", (e) => {
        if (e.target.src.includes("assets/volume.svg")) {
            volume.src = "assets/mute.svg"
            currentSong.volume = 0
            document.querySelector(".volume").value = 0
        } else {
            volume.src = "assets/volume.svg"
            currentSong.volume = 0.1
            document.querySelector(".volume").value = 10
        }
    })

}

main() 