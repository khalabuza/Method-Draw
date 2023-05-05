MD.SpIntegration = function () {
    console.log("SPIntegration Loaded");
    this.editor = editor;
    
    function getUrlEntity() {
        const windowUrl = window.location.search;
        const params = new URLSearchParams(windowUrl);
        if (params.has("entity_id")) {
            return params.get("entity_id");
        }
        return null;
    }

    function getUrlReturn() {
        const windowUrl = window.location.search;
        const params = new URLSearchParams(windowUrl);
        if (params.has("returnUrl")) {
            return params.get("returnUrl");
        }
        return null;
    }

    function SPSave() {
        console.log("SAVE TO SP");

        //get entity_id from url parm
        var entity_id = getUrlEntity();
        var returnUrl = getUrlReturn();
        if (entity_id === null || returnUrl === null) return;

        const str = '<?xml version="1.0"?>\n' + svgCanvas.svgCanvasToString();
        //encode svg to base64
        const b64Data = btoa(str);

        const requestOptions = {
            method: 'Post',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entity_id: entity_id, icon: b64Data })
        };

        fetch(`https://${returnUrl}/api/SaveFromSVGEditor`, requestOptions)
            .then(response => response.text())//promise
            .then(status => {//promise result
                if (JSON.parse(status) === 'Success') {
                    console.log("Saved to SP");
                    editor.modal.schematicProSaved.open();
                }
            })
            .catch(err => {
                console.log(err);
                editor.modal.schematicProFailed.open();
                $('#sp_save_error_message').html(err.message);
            });
    }

    

    async function SPOpen() {
        try {
            //get entity_id from url parm
            var entity_id = getUrlEntity();
            var returnUrl = getUrlReturn();
            if (entity_id === null || returnUrl === null) return;

            var svgContent = "";
            var SvgName = ""
            await fetch(`https://${returnUrl}/api/EntityByIdForSVGEditor/${entity_id}`, {
                method: 'Get',
                credentials: 'include'
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    if (data.length === 1) {//cannot be more than 1 item
                        svgContent = atob(data[0].icon);
                        SvgName = data[0].iconlabel + ".svg";
                        state.set("canvasTitle", SvgName);
                    }
                }).catch(err => {
                    console.log(err);
                    return;
                })

            if (svgContent !== "") {
                editor.import.loadSvgString(svgContent)
            } else {
                alert("Could not find Entity_id!  Please contact support")
            }


        } catch (err) {
            if (err.name !== 'AbortError') {
                return console.error(err)
            }
        }
    }


    this.SPOpen = SPOpen;
    this.SPSave = SPSave;
    this.getUrlEntity = getUrlEntity;
    this.getUrlReturn = getUrlReturn;
}