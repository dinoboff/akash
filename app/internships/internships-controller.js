/**
 * oep.internships.controllers - Module for events subsection controllers.
 *
 * Defines `OepInternships`
 *
 */

(function() {
  'use strict';

  /**
   * OepInternships - Controller for the internships subsection.
   * 
   * Populate the scope currentUser property with current user info.
   *
   *
   */
  function OepInternships(currentUser, internshipApi) {
    this.api = internshipApi;
    this.currentUser = currentUser;
    this.checked=0;
    this.limit=5;
    this.reset();
    this.companies = [
      { name:'Visa', selected: false},
      { name:'Google', selected: false},
      { name:'Accenture', selected: false},
      { name:'Amazon', selected: false},
      { name:'Carousel', selected: false},
      { name:'Facebook', selected: false},
      { name:'Cisco', selected: false},
      { name:'HP', selected: false},
      { name:'IBM', selected: false},
      { name:'Nitrous.io', selected: false},
      { name:'PayPal', selected: false},
      { name:'RevolutionR', selected: false},
      { name:'Salesforce', selected: false},
      { name:'SAP', selected: false},
      { name:'SAS', selected: false},
      { name:'Singtel', selected: false},
      { name:'Viki', selected: false}
    ];
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    this.StartDate = (year + '-' + month + '-' + day);

    this.checkChanged = function(company){
     // console.log(company.name);
      if(company.selected) {
        this.checked++;
      }
      else {this.checked--;}
    };
  }
  OepInternships.prototype.save = function(internship,companies) {
    var self = this;
    this.saving=true;
    this.saved=false;
    var selectedCompanies=[];
    for ( var i=0; i < companies.length;i++){
      if(companies[i].selected ){
        selectedCompanies.push(companies[i]);
      }
    }
    internship.selectedCompanies= selectedCompanies;
    internship.user = this.currentUser.data.name;
    return this.api.create(internship).then(function(internship) {
      self.internship = internship;
      self.saved = true;
      //console.log(internship); 
    })['finally'](function() {
      self.saving = false;
    });
      
  };
  
  
  OepInternships.prototype.reset = function() {
    var self=this;
    this.saving = false;
    this.saved = false;
    this.internship = {};
    this.internship.selectedValue = 'No';
    this.internship.sDate = '';
    this.internship.eDate = '';
    this.internship.notifications ='';
    this.internship.public ='';
    this.internship.selectedCompanies = '';
    this.checked=0;
    this.companies = [
      { name:'Visa', selected: false},
      { name:'Google', selected: false},
      { name:'Accenture', selected: false},
      { name:'Amazon', selected: false},
      { name:'Carousel', selected: false},
      { name:'Facebook', selected: false},
      { name:'Cisco', selected: false},
      { name:'HP', selected: false},
      { name:'IBM', selected: false},
      { name:'Nitrous.io', selected: false},
      { name:'PayPal', selected: false},
      { name:'RevolutionR', selected: false},
      { name:'Salesforce', selected: false},
      { name:'SAP', selected: false},
      { name:'SAS', selected: false},
      { name:'Singtel', selected: false},
      { name:'Viki', selected: false},
      { name: 'Other', selected:false}
    ];
    this.currentUser.auth().then(function(data) {
      if (!data || !data.info || !data.info.email) {
        return;
      }

      self.internship.from = data.info.email;
    });
  };
  angular.module('oep.internships.controllers',
  ['oep.internships.services',
  'oep.user.services']).

  controller('OepInternships',
  ['oepCurrentUserApi',
  'oepInternshipsApi',
   OepInternships
  ]);
})();