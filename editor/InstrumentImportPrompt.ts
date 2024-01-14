// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import { SongDocument } from "./SongDocument";
//import { SongEditor } from "./SongEditor";
import { Prompt } from "./Prompt";
import { HTML } from "imperative-html/dist/esm/elements-strict";
import { Channel, Instrument } from "../synth/synth";
import { ChangePasteInstrument } from "./changes";

const {button, div, h2, input, label, br} = HTML;

export class InstrumentImportPrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({class: "cancelButton"});
        private readonly _replaceBox: HTMLInputElement = input({style: "width: 3em; margin-left: 1em;", type: "checkbox"});
		private readonly _replaceSingleBox: HTMLInputElement = input({style: "width: 3em; margin-left: 1em;", type: "checkbox"});
		private readonly _fileInput: HTMLInputElement = input({type: "file", accept: ".json,application/json"});

		public readonly container: HTMLDivElement = div({ class: "prompt noSelection", style: "width: 250px;" },
		    h2("Import Instrument(s)"),
            label({style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;"},
			"Replace all instruments",
			br(),
			"in channel:",
			this._replaceBox,
		    ),
			label({style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;"},
			"Replace only selected",
			br(),
			"instrument:",
			this._replaceSingleBox,
		    ),
		this._fileInput,
		this._cancelButton,

		//If file has 1 instrument, and no checkboxes are selected, add all the instrument to the end
		//If file has multiple instruments, and no checkboxes are selected, add all the instruments to the end

		//If file has 1 instrument, and checkbox 1 is selected, clear all current isntruments and add the file instrument
		//If file has multiple instruments, and checkbox 1 is selected, clear all current isntruments and add the file instruments

		//If file has 1 instrument, and checkbox 2 is selected, replace the currently selected instrument with the file instrument
		//If file has multiple instruments, and checkbox 2 is selected, replace the currently selected instrument with the file instrument 1, add all the rest of the instruments to the end

		//importing a multi instrument with no multi instrument settings turned on will alert an a warning and not import the instrument
		//checkbox 1 and 2 will always be grayed out if multi instruments arent enabled.

		//doc.song.layeredInstruments 
		//doc.song.patternInstruments
	);

	constructor(private _doc: SongDocument) {//, private _editor: SongEditor) {
		this._fileInput.addEventListener("change", this._whenFileSelected);
		this._cancelButton.addEventListener("click", this._close);
		this._replaceBox.addEventListener("change", this._lol);
		if ((_doc.song.patternInstruments||_doc.song.layeredInstruments)==false) {
			this._replaceSingleBox.disabled = true;
			this._replaceBox.disabled = true;
		}
	}

		private _whenFileSelected = (): void => {
			const file: File = this._fileInput.files![0];
			if (!file) return;
			const reader: FileReader = new FileReader()
			reader.onload = (e) => {
			try {
					const fileParsed: any = JSON.parse(String(e.target?.result));
					console.log("Processing file:", fileParsed)
					if (fileParsed.constructor.name == "Array") {
						if ((this._doc.song.patternInstruments||this._doc.song.layeredInstruments)==false) {
							alert("Instrument file contains multiple instruments! Please turn on pattern or layered instruments!");
							return;
						}
						this._import_multiple();
						return;
					} else {
						this._import_single(fileParsed);
					}
				} catch (error) {
					console.error('Error reading file:', error);
				}
			};
			reader.readAsText(file);

			this._close();
	}

		private _lol = (): void => {
		this._replaceSingleBox.disabled = this._replaceBox.checked
	}

		private _close = (): void => {
		this._doc.undo();
	}

		public cleanUp = (): void => {
		this._fileInput.removeEventListener("change", this._whenFileSelected);
		this._cancelButton.removeEventListener("click", this._close);
		this._replaceBox.removeEventListener("change", this._lol);
	}

        public _import_multiple = (): void => {
    }
        public _import_single = (file: any): void => {
			const channel: Channel = this._doc.song.channels[this._doc.channel];
			if (this._replaceBox.checked) {
				//Delete all instruments then add this one
				return;
			}
			if (this._replaceSingleBox.checked) {
				const instrumentCopy: any = JSON.parse(String(file));   
                const instrument: Instrument = channel.instruments[this._doc.getCurrentInstrument()];
				this._doc.record(new ChangePasteInstrument(this._doc, instrument, instrumentCopy));
				return;
			}
			//Add this instrument
			return;
    }

}
