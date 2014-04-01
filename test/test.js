var expect = require("chai").expect;
var path   = require("path");

var Robot       = require("hubot/src/robot");
var TextMessage = require("hubot/src/message").TextMessage;

// new Robot creates some j
//process.setMaxListeners(0);


describe("Hubot-Substitute Functionality", function() {
    var robot;
    var user;
    var adapter;

    beforeEach(function(done) {
        // create new robot, without http, using the mock adapter
        robot = new Robot(null, "mock-adapter", false, "TestBot");

        robot.adapter.on("connected", function() { 
            // only load scripts we absolutely need, like auth.coffee
            process.env.HUBOT_AUTH_ADMIN = "1";
            robot.loadFile(
                path.resolve(
                    path.join("node_modules/hubot/src/scripts")
                ),
                "auth.coffee"
            );

            // load the module under test and configure it for the
            // robot.  This is in place of external-scripts
            require("../index")(robot);

            // create a user
            user = robot.brain.userForId("1", {
                name: "mocha",
                room: "#mocha"
            });

            adapter = robot.adapter;

            setTimeout(done, 250);
        });
        robot.run();
    });

    afterEach(function() {
        robot.shutdown();
    });

    describe("what did i say", function() { 
      /*
      * hubot what did i say
      */
      // Ask Hubot what you said, without saying anything to it previously
      //
      it("responds to what did i say without previous input", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal("I have no idea what you said");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, robot.name+" what did i say"));
      });

      // Ask Hubot what you said, after saying something in the room
      //
      it("responds to what did i say with correct output", function(done) {
          var text = [randomWord(15),randomWord(12),randomWord(7)].join(' ');

          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal("You said: "+text);
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, text)); 
        adapter.receive(new TextMessage(user, robot.name+" what did i say"));
      });
    });

    describe("valid substitute patterns", function() { 
      /*
      * s/find/replace/modifier
      */
      // substitute beer for stout beer
      //
      it("s/beer/stout beer", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal(user.name+": I could really go for a stout beer right now");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, "I could really go for a beer right now"));
        adapter.receive(new TextMessage(user, "s/beer/stout beer"));
      });

      // substitute their for their with a trailing forwardslash
      //
      it("s/their/there/", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal(user.name+": I can't wait until we get there");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, "I can't wait until we get their")); 
        adapter.receive(new TextMessage(user, "s/their/there/"));
      });

      // substitute woof for moo globally
      //
      it("s/woof/moo/g", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal(user.name+": The cow goes moo moo");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, "The cow goes woof woof")); 
        adapter.receive(new TextMessage(user, "s/woof/moo/g"));
      });

      // substitute remove found string
      //
      it("s/what does the fox say//g", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal(user.name+": sometimes i wonder");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, "sometimes i wonder what does the fox say")); 
        adapter.receive(new TextMessage(user, "s/what does the fox say//g"));
      });

      // string with escaped chars
      //
      it("s/\\\\/ith\/g", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal(user.name+": with or without");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, "w\\ or w\\out")); 
        adapter.receive(new TextMessage(user, "s/\\\\/ith\/g"));
      });

      // string with more escaped chars
      //
      it("s/\\\//ith\/g", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal(user.name+": with or without");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, "w\/ or w\/out")); 
        adapter.receive(new TextMessage(user, "s/\\\//ith\/g"));
      });

      // string with more multiple escaped chars
      //
      it("s/\\//slash/g", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal(user.name+": http:slashslashwww.dumped.comslash");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, "http://www.dumped.com/")); 
        adapter.receive(new TextMessage(user, "s/\\//slash/g"));
      });

      // string with numbers 
      //
      it("s/\\d/number/g", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal(user.name+": Friday April numbernumberth, numbernumbernumbernumber");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, "Friday April 13th, 2014")); 
        adapter.receive(new TextMessage(user, "s/\\d/number/g"));
      });

      // string with multiple match numbers 
      //
      it("s/\\d{4}/year/g", function(done) {
          adapter.on("send", function(envelope, strings) {
              try { 
                expect(strings[0]).to.equal(user.name+": Friday April 13th, year");
                done();
              } catch(e) { 
                done(e);
              }
          });

        adapter.receive(new TextMessage(user, "Friday April 13th, 2014")); 
        adapter.receive(new TextMessage(user, "s/\\d{4}/year/g"));
      });
     });

    describe("invalid substitute patterns", function() { 
      // test bad regex
      //
      it("s/woof/", function(done) {
          var replied = false;

          // if doesn't reply we're good --
          // there's probably a better way to do this, but for now
          // it seems like 25ms is long enough to give the bot a 
          // chance to reply
          setTimeout(function() { 
            if (replied) { 
              done( new Error("replied when shouldn't have, no replace string") );
            }
            else {
              done(); 
            }
          }, 25);

          // if it does reply, throw an error
          adapter.on("send", function(envelope, strings) {
            replied = true;
          });

        adapter.receive(new TextMessage(user, "The cow goes woofmoo")); 
        adapter.receive(new TextMessage(user, "s/woof/"));
      });
    });
});

function randomWord(length) { 
  length = length || 5;

  var text = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < length; i++ ) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
