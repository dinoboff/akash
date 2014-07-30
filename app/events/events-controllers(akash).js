(function() {
  'use strict';

  var module = angular.module(
    'oep.events.controllers', [
      'oep.config',
      'oep.user.services',
      'oep.card.directives'
    ]);
  
  module.controller('OepEventsFormCtrl', [
    'oepUsersApi',
    'oepCurrentUserApi',
    'oepSettings',
    '$window',
     function OepEventsFormCtrl(userApi, currentUserApi, settings, window){
       var self = this,
        $ = window.jQuery;
       
       this.theEvent = {};
       this.theEvent.eventName = 'My Event';
       this.theEvent.schoolType = 'Poly';
       this.theEvent.count = 40;
       this.theEvent.criteria = "Rescue Mission badge";
       this.theEvent.service = "Code Combat";
       this.theEvent.reward = "earn a letter of recommendation for university applications";
       this.theEvent.comments = "Have fun!";
       
       this.schoolTypes = [
         {"name":"JC"},
         {"name":"Poly"},
         {"name":"University"},
         {"name":"all"},
         {"name":"a specific school's"},
       ];
       this.criteriaOptions = ['Rescue Mission badge', 'most points possible','most badges possible'];
       this.services = ["Code Combat", "Code School", "Treehouse"];
       this.rewardOptions = [
         "get bonus points from your teacher", 
         "help the students at your school to win lucky draw prizes", 
         "earn a letter of recommendation for university applications", 
         "visit the sponsoring company", 
         "participate in a campus tour of the sponsoring university", 
         "win the competition prize"
       ];

        this.create_event = function(obj){
          alert("Posting the new event here.");
          
          $http({
            url: '/jsonapi/event',
            method: "POST",
            data: this.theEvent
          })
          
          .then(
            function(response) {
              // success
            }, 
            function(response) { // optional
              // failed
            }
          );
        }
  
        this.user = currentUserApi;

          //Define the url resource in one place. 
          //If and id is passed, it will be added to the end of the url otherwise it will be left off. 
          this.Player = $resource('/jsonapi/player/:id');

          //Puts the list of items into the variable items. 
          this.list = function(){
            //You need to use query when you expect a list in return. 
            //Otherwise you will see an error like "TypeError: Object #<e> has no method 'push'".
            this.items = this.Player.query();
          }

          //Puts the list of items into the variable items. 
          this.fetch = function(obj){
            //You need to use get when you expect an object in return. 
            //We only need the id {"id":2} but the obj already has id so it is easy to use. 
            this.item = this.Player.get({"id":obj.id});
          }

          //Adding is like updating but without an id
          this.add = function(obj){
            obj.id = null;
            this.update(obj);
          }

          //Update attempts to update the item with the current id. 
          //The new item is placed in this.item
          this.update = function(obj){
            temp = new this.Player(obj);
            //We can do this async call for a quick and easy post, but we want to use a callback so that we can update our list of players.
            //This is fancy javascript callback stuff.
            //this.item = temp.$save(); 
            temp.$save({'id':obj.id},function(response){
                //Put the response in to item
                this.item = response;
                //Then update the list of Players from the server since we just created one. 
                this.list();
            });

          }


      }