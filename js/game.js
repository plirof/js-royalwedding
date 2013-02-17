var Game = {
	engine: new ROT.Engine(),
	player: null,
	level: null,
	story: null,
	
	init: function() {
		window.addEventListener("load", this);
	},

	handleEvent: function(e) {
		switch (e.type) {
			case "load":
				window.removeEventListener("load", this);
				this._load();
			break;

			case "resize":
				this._resize();
			break;
		}
	},

	switchLevel: function(newLevel, cell, direction) {
		var oldLevel = this.level;
		this.level = null;
		if (oldLevel) { this.engine.lock(); }

		var position = newLevel.getCellById(cell || "start").getPosition();
	
		if (oldLevel) { /* clear the old level */
			oldLevel.removeBeing(this.player);
			this.engine.clear();
		}

		this.level = newLevel;

		/* welcome the new level */
		newLevel.setBeing(this.player, position[0], position[1]);
		for (var p in newLevel.beings) {
			this.engine.addActor(newLevel.beings[p]);
		}

		this._resize();
		this._transitionLevel(newLevel, oldLevel, direction);

		this.engine.unlock();
	},

	_transitionLevel: function(newLevel, oldLevel, direction) {
		var oppositeMap = {
			left: "right",
			right: "left",
			top: "bottom",
			bottom: "top",
			fade: "fade"
		};

		var newNode = newLevel.getContainer();
		if (direction) { newNode.className = direction; }
		document.querySelector("#level").appendChild(newNode);

		document.body.offsetWidth; /* FIXME hack */

		if (oldLevel && oppositeMap[direction]) { oldLevel.getContainer().className = oppositeMap[direction]; }
		newNode.className = "";
	},

	_load: function(e) {
		this.story = new Game.Story();
		this.description = new Game.Description();
		this.legend = new Game.Legend(document.querySelector("#legend"));
		this.player = Game.Beings.create("player");
		new Game.Intro().then(this._start.bind(this));
	},

	_start: function(e) {
		window.addEventListener("resize", this);
		Game.LevelManager.get("castle").then(function(level) {
			this.switchLevel(level);
		}.bind(this));
	},
	
	_resize: function() {
		if (!this.level) { return; }
		var parent = document.querySelector("#level");
		this.level.resize(parent.offsetWidth, parent.offsetHeight);
	}
}

Game.init();
