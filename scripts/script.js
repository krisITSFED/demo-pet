// === Game State ===
let petType, petName;
let hunger = 5, happiness = 5;
let countdown = 60 * 60;

// === Utility Functions ===
function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function updateStats() {
    updateBars("hunger-bar", hunger);
    updateBars("happiness-bar", happiness);
    saveStats(); 
}

// --- Utility to update bar UI ---
function updateBars(id, value) {
    let container = $(`#${id}`);
    container.empty();
    for (let i = 0; i < 10; i++) {
        let bar = $('<div class="bar"></div>');
        if (i < value) bar.addClass("filled");
        container.append(bar);
    }
}

function onHappy() {
    $("#pet").addClass("happy");
    setTimeout(() => $("#pet").removeClass("happy"), 3000);
}

// --- Save stats to cookies (optional, if you want) ---
function saveStats() {
    document.cookie = `petType=${petType}; path=/`;
    document.cookie = `petName=${petName}; path=/`;
    document.cookie = `hunger=${hunger}; path=/`;
    document.cookie = `happiness=${happiness}; path=/`;
}

// --- Countdown loop ---
function updateTimer() {
    countdown--;

    if (countdown === 48 * 60) { // 48 minutes 
        hunger = Math.max(0, hunger - 1);
        updateBars("hunger-bar", hunger);
    }

    if (countdown === 24 * 60) { // 24 minutes 
        happiness = Math.max(0, happiness - 1);
        updateBars("happiness-bar", happiness);
    }

    if (countdown <= 0) {
        countdown = 60 * 60; // Reset back to full hour
    }

    updateTimerDisplay();
    saveStats();
}

// --- Start loop ---
function startStaticTimer() {
    updateBars("hunger-bar", hunger);
    updateBars("happiness-bar", happiness);
    updateTimerDisplay();
    setInterval(updateTimer, 1000); // 1 second for demo, use 60000 for real minute
}

function generateSaveCode() {
    let data = {
        petType,
        petName,
        hunger,
        happiness
    };
    return btoa(JSON.stringify(data));
}

function loadFromSaveCode() {
    let inputCode = $("#load-save-code").val().trim();
    if (!inputCode) {
        alert("Please enter a save code!");
        return;
    }

    try {
        let decoded = atob(inputCode);
        let data = JSON.parse(decoded);

        petType = data.petType;
        petName = data.petName;
        hunger = data.hunger;
        happiness = data.happiness;

        document.cookie = `petType=${petType}; path=/`;
        document.cookie = `petName=${petName}; path=/`;
        document.cookie = `hunger=${hunger}; path=/`;
        document.cookie = `happiness=${happiness}; path=/`;

        applyPetSettings();
        updateStats();
    } catch (e) {
        alert("Invalid save code! Please check and try again.");
    }
}

function applyPetSettings() {
    $("#petName").text(petName);
    $("#pet").css("background-image", petType === "dog"
        ? "url('images/dog_idle_sprite.svg')"
        : "url('images/cat_idle_sprite.svg')");
    $(".welcome-screen").addClass("hidden");
    $(".gamewrapper").css("display", "flex");
    $("#pet").addClass("idle-animation");
}

function showSaveonExit() {
    const dlg = $("#saveDialog")[0];
    if ($(".gamewrapper").hasClass("active") && !dlg.open) {
        dlg.showModal();
        $("#saveCodeOutput").text(generateSaveCode());
    }
}

function startTimer() {
    
    setInterval(updateTimer, 60000); // every 60 seconds
}

// --- Update visual countdown ---
function updateTimerDisplay() {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    $("#countdown-display").text(`${minutes}:${seconds.toString().padStart(2, '0')}`);
}

// === Main jQuery Logic ===
$(document).ready(function () {
    petType = getCookie("petType");
    petName = getCookie("petName");
    hunger = getCookie("hunger") ? parseInt(getCookie("hunger")) : 5;
    happiness = getCookie("happiness") ? parseInt(getCookie("happiness")) : 5;

    if (petType && petName) {
        updateTimer();
        applyPetSettings();
        updateStats();
    } else {
        $(".welcome-screen").removeClass("hidden");
        $(".gamewrapper").hide();
    }

    $(".pet-btn").click(function () {
        petType = $(this).data("type");
        $(".pet-btn").removeClass("selected");
        $(this).addClass("selected");
    });

    $(".start-btn").click(function () {
        let petNameInput = $("#pet-name-input").val().trim();
        if (!petType || petNameInput === "") {
            alert("Please choose a pet and enter a name!");
            return;
        }

        petName = petNameInput;
        hunger = 5;
        happiness = 5;

        document.cookie = `petType=${petType}; path=/`;
        document.cookie = `petName=${petName}; path=/`;
        document.cookie = `hunger=${hunger}; path=/`;
        document.cookie = `happiness=${happiness}; path=/`;

        $(".gamewrapper").addClass("active");

        applyPetSettings();
        updateStats();
    });

    $("#feed").click(function () {
        if (hunger < 10) hunger++;
        updateStats();
        onHappy();
    });

    $("#play").click(function () {
        if (happiness < 10) happiness++;
        updateStats();
        onHappy();
    });

    $("#edit-button").click(function () {
        $("#edit-modal")[0].showModal();
        $("#save-code-display").text(generateSaveCode());
    });

    $("#close-modal").click(() => $("#edit-modal")[0].close());

    $("#show-save-code").click(function () {
        const code = $("#save-code-display").text();
        const tooltip = document.getElementById($(this).attr("popover-target"));
        navigator.clipboard.writeText(code).then(() => {
            tooltip.showPopover();
            setTimeout(() => tooltip.hidePopover(), 2000);
        }).catch(console.error);
    });

    $("#load-save-code-btn").click(loadFromSaveCode);

    $("#save-name-btn").click(function () {
        let newName = $("#new-pet-name").val().trim();
        $("#petName").text(newName);
        document.cookie = `petName=${newName}; path=/`;
        $("#edit-modal")[0].close();
        location.reload();
    });

    $("#reset-btn").click(function () {
        ["petName", "petType", "hunger", "happiness"].forEach(name => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        location.reload();
    });

    $(document).on("mouseout", function (e) {
        if (!e.relatedTarget && !e.toElement && e.clientY <= 0) {
            showSaveonExit();
        }
    });

    $("#copySaveCodeBtn").click(function () {
        const code = $("#saveCodeOutput").text();
        const tooltip = document.getElementById($(this).attr("popover-target"));
        navigator.clipboard.writeText(code).then(() => {
            tooltip.showPopover();
            setTimeout(() => tooltip.hidePopover(), 2000);
        }).catch(console.error);
    });

    $("#close-browser").click(function () {
        document.cookie = `saveCode=${generateSaveCode()}; path=/; max-age=31536000`;
        window.close();
    });

    $("#cancel-dialog").click(() => $("#saveDialog")[0].close());

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            $("#howToDialog")[0]?.close();
            $("#updateBrowserDialog")[0]?.close();
            document.body.classList.remove("no-interact");
        }
    });

    //show timer
    $(document).on('keydown', function (event) {
        // Check if the 'Ctrl' and 'Alt' keys are pressed along with 'D'
        if (event.ctrlKey && event.altKey && event.keyCode === 68) {
            $("#countdown-display").toggleClass("hidden");
        }
    });

    $("#openHowToBtn").on("click", () => {
        $("#howToDialog")[0].showModal();
    });

    $("#closeHowToBtn").on("click", () => {
        $("#howToDialog")[0].close();
    });


    // ⏱ Start timer logic
    startStaticTimer();
});
