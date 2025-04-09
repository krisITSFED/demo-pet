$(document).ready(function () {
    let petType = getCookie("petType");
    let petName = getCookie("petName");
    let hunger = getCookie("hunger") ? parseInt(getCookie("hunger")) : 5;
    let happiness = getCookie("happiness") ? parseInt(getCookie("happiness")) : 5;

    if (petType && petName) {
        checkTimeForStats(); // Check time-based updates before loading game
        $("#petName").text(petName);
        if (petType === "dog") {
            $("#pet").css({
                "background-image": "url('images/dog_idle_sprite.svg')"
            });
        } else {
            $("#pet").css({
                "background-image": "url('images/cat_idle_sprite.svg')"
            });
        }
        $(".welcome-screen").addClass("hidden");
        $(".gamewrapper").css("display", "flex");

        $("#pet").addClass("idle-animation");
        updateStats();
    } else {
        $(".welcome-screen").removeClass("hidden");
        $(".gamewrapper").css("display", "none");
    }


    $(".pet-btn").click(function () {
        petType = $(this).data("type");

        // Highlight the selected button
        $(".pet-btn").removeClass("selected");
        $(this).addClass("selected");
    });

    $(".start-btn").click(function () {
        let petNameInput = $("#pet-name-input").val().trim();

        if (!petType || petNameInput === "") {
            alert("Please choose a pet and enter a name!");
            return;
        }

        // Save pet info
        document.cookie = `petType=${petType}; path=/`;
        document.cookie = `petName=${petNameInput}; path=/`;

        // Update UI
        $("#petName").text(petNameInput);
        if (petType === "dog") {
            $("#pet").css({
                "background-image": "url('images/dog_idle_sprite.svg')"
            });
        } else {
            $("#pet").css({
                "background-image": "url('images/cat_idle_sprite.svg')"
            });
        }

        // Hide welcome screen, show game
        $(".welcome-screen").addClass("hidden");
        $(".gamewrapper").css("display", "flex");

        // Reset hunger and happiness if they don't exist
        hunger = 5;
        happiness = 5;
        document.cookie = `hunger=${hunger}; path=/`;
        document.cookie = `happiness=${happiness}; path=/`;

        updateStats();
    });

    function updateStats() {
        updateBars("hunger-bar", hunger);
        updateBars("happiness-bar", happiness);
        document.cookie = `hunger=${hunger}; path=/`;
        document.cookie = `happiness=${happiness}; path=/`;
    }

    function updateBars(id, value) {
        let container = $(`#${id}`);
        container.empty();
        for (let i = 0; i < 10; i++) {
            let bar = $('<div class="bar"></div>');
            if (i < value) bar.addClass("filled");
            container.append(bar);
        }
    }

    // happy animation 
    function onHappy() {
        $("#pet").addClass("happy");

        setTimeout(function () {
            $("#pet").removeClass("happy");
        }, 3000); // 3 seconds
    }


    function getCookie(name) {
        let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

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

    function checkTimeForStats() {
        let lastVisit = getCookie("lastVisit");
        let currentTime = Date.now();

        if (lastVisit) {
            let lastTime = parseInt(lastVisit);
            if (!isNaN(lastTime)) {
                let timeDiff = (currentTime - lastTime) / (1000 * 60); // in minutes

                // Sanity check — if timeDiff is way too large, maybe limit it?
                timeDiff = Math.min(timeDiff, 24 * 60); // cap at 24 hours worth

                // Define the decay intervals
                const hungerInterval = 48; // mins
                const happinessInterval = 24; // mins

                // How many times each interval has passed
                let hungerDecrease = Math.floor(timeDiff / hungerInterval);
                let happinessDecrease = Math.floor(timeDiff / happinessInterval);

                hunger = Math.max(0, hunger - hungerDecrease);
                happiness = Math.max(0, happiness - happinessDecrease);
            }
        }

        // Update the lastVisit timestamp
        document.cookie = `lastVisit=${currentTime}; path=/`;
        updateStats();
    }


    function generateSaveCode() {
        let data = {
            petType: petType,
            petName: petName,
            hunger: hunger,
            happiness: happiness
        };

        let jsonData = JSON.stringify(data);
        return btoa(jsonData); // Return Base64 encoded save code
    }


    function loadFromSaveCode() {
        let inputCode = $("#load-save-code").val().trim();

        if (!inputCode) {
            alert("Please enter a save code!");
            return;
        }

        try {
            let decodedData = atob(inputCode); // Decode Base64
            let data = JSON.parse(decodedData);

            // Restore game data
            petType = data.petType;
            petName = data.petName;
            hunger = data.hunger;
            happiness = data.happiness;

            // Update cookies
            document.cookie = `petType=${petType}; path=/`;
            document.cookie = `petName=${petName}; path=/`;
            document.cookie = `hunger=${hunger}; path=/`;
            document.cookie = `happiness=${happiness}; path=/`;

            // Update UI
            $("#petName").text(petName);
            if (petType === "dog") {
                $("#pet").css({
                    "background-image": "url('images/dog_idle_sprite.svg')"
                });
            } else {
                $("#pet").css({
                    "background-image": "url('images/cat_idle_sprite.svg')"
                });
            }

            $(".welcome-screen").addClass("hidden");
            $(".gamewrapper").css("display", "flex");

            updateStats();
        } catch (e) {
            alert("Invalid save code! Please check and try again.");
        }
    }



    // ================  Dialog ===============
    const dialog = $("#edit-modal")[0];
    // Open the dialog when clicking the edit button
    $("#edit-button").click(function () {
        dialog.showModal();
        $("#save-code-display").text(generateSaveCode());

    });

    //Close the dialog when clicking the close button
    $("#close-modal").click(function () {
        dialog.close(); // Closes the modal
    });

    // Edit dialog buttons
    $("#show-save-code").on("click", function () {
        const code = $("#save-code-display").text();
        const popoverId = $(this).attr("popover-target");
        const tooltip = document.getElementById(popoverId);

        navigator.clipboard.writeText(code).then(() => {
            tooltip.showPopover();
            setTimeout(() => {
                tooltip.hidePopover();
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy:", err);
        });
    });
    $("#load-save-code-btn").click(loadFromSaveCode);

    // Save new name
    $("#save-name-btn").click(function () {
        let newNameInput = $("#new-pet-name").val().trim();
        $("#petName").text(newNameInput);
        document.cookie = `petName=${newNameInput}; path=/`;
        dialog.close();
        location.reload();
    });

    // Reset game (clear cookies and reload)
    $("#reset-btn").click(function () {
        document.cookie = "petName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "petType=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "hunger=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "happiness=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        location.reload();
    });

    // Before you go modal
    $(document).on("mouseout", function (e) {
        if (!e.relatedTarget && !e.toElement && e.clientY <= 0) {
            showSaveonExit(); // Call your dialog logic
        }
    });

    function showSaveonExit() {
        const dlg = $("#saveDialog")[0];
        if (!dlg.open) {
            dlg.showModal();
            $("#saveCodeOutput").text(generateSaveCode());
        }
    }

    $("#copySaveCodeBtn").on("click", function () {
        const code = $("#saveCodeOutput").text();
        const popoverId = $(this).attr("popover-target");
        const tooltip = document.getElementById(popoverId);

        navigator.clipboard.writeText(code).then(() => {
            tooltip.showPopover();
            setTimeout(() => {
                tooltip.hidePopover();
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy:", err);
        });
    });

    $("#close-browser").on("click", function () {
        // Save to cookies
        let saveCode = generateSaveCode();
        document.cookie = `saveCode=${saveCode}; path=/; max-age=31536000`; // 1 year

        // Close the window/tab
        window.close(); // Only works if the window was opened via JS (like window.open)

        // Optional fallback if window.close() doesn't work:
        //alert("You can now close the tab or come back later using your save code.");
    });

    $("#cancel-dialog").on("click", function () {
        $("#saveDialog")[0].close();
    });


    setInterval(checkTimeForStats, 60000);

    //Check if CSS nesting is supported
    function supportsCSSNesting() {
        try {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync("a { & b { color: red; } }");
            return true;
        } catch (e) {
            return false;
        }
    }

    if (!supportsCSSNesting()) {
        const dialog = document.getElementById("updateBrowserDialog");
        const body = document.body;

        if (dialog) {
            dialog.showModal();
            body.classList.add("no-interact");
        }

        document.getElementById("closeUpdateDialog").addEventListener("click", () => {
            dialog.close();
            body.classList.remove("no-interact");
        });
    }

    // NotePad 
    $("#openHowToBtn").on("click", () => {
        $("#howToDialog")[0].showModal();
    });

    $("#closeHowToBtn").on("click", () => {
        $("#howToDialog")[0].close();
    });


});
