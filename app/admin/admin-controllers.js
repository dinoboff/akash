/**
 * oep.admin.controllers - Controllers for admin subsection.
 *
 * Defines:
 *
 * - `OepAdminMetrixCtrl`
 * - `OepAdminSuggestionsCtrl`
 *
 */
(function() {
  'use strict';

  var module = angular.module(
    'oep.admin.controllers', ['oep.user.services', 'oep.suggestions.services','oep.internships.services']
  );


  /**
   * OepAdminMetrixCtrl - controller for the Metric partial.
   * TODO: show metric charts
   */
  function OepAdminMetrixCtrl(menu) {
    this.menu = menu;
  }

  module.controller('OepAdminMetrixCtrl', ['menu', OepAdminMetrixCtrl]);



  /**
   * OepAdminEventsCtrl - Controller for the events partials.
   *
   * Assuming the current user is an admin, it populate the controller
   * with the list of events, queried from the OEP API.
   *
   */
  function OepAdminEventsCtrl(oepEventsApi, menu, events) {
    var self = this;

    // oepEventsApi.get()
    this.events = events;
    this.menu = menu;

    /**
     * OepAdminEventsCtrl.next - query more events and add them
     * to the list of events.
     *
     */
    this.next = function(cursor) {
      oepEventsApi.get(cursor).then(function(events) {
        if (!self.events) {
          self.events = [];
        }

        self.events = self.events.concat(events);
        self.events.cursor = events.cursor;
      });
    };
  }

  module.controller('OepAdminEventsCtrl', [
    'oepEventsApi', 'menu', 'events', OepAdminEventsCtrl
  ]);
  
  
  
  /**
   * OepAdminSuggestionsCtrl - Controller for the suggestions partials.
   *
   * Assuming the current user is an admin, it populate the controller
   * with the list of suggestions, queried from the OEP API.
   *
   */
  function OepAdminSuggestionsCtrl(oepSuggestionsApi, menu, suggestions) {
    var self = this;

    // oepSuggestionsApi.get()
    this.suggestions = suggestions;
    this.menu = menu;

    /**
     * OepAdminSuggestionsCtrl.next - query more suggestions and add them
     * to the list of suggestions.
     *
     */
    this.next = function(cursor) {
      oepSuggestionsApi.get(cursor).then(function(suggestions) {
        if (!self.suggestions) {
          self.suggestions = [];
        }

        self.suggestions = self.suggestions.concat(suggestions);
        self.suggestions.cursor = suggestions.cursor;
      });
    };
  }

  module.controller('OepAdminSuggestionsCtrl', [
    'oepSuggestionsApi', 'menu', 'suggestions', OepAdminSuggestionsCtrl
  ]);

  /**
   * OepAdminInternshipsCtrl - Controller for the internship data.
   *
   * Assuming the current user is an admin, it populate the controller
   * with the sorted list of internship data, queried from the OEP API.
   *
   */
  function OepAdminInternshipsCtrl(oepInternshipsApi, menu, internships) {
    //var self = this;
    this.temp = internships;
    this.internships = [];
    for( var i=0 ; i< this.temp.length; i++){
      this.internships.push(this.temp[i]);
    }
    console.log(this.internships);
    this.menu = menu;
    this.dateFilter='First Period';
    this.dateOptions = ['First Period','Second Period'];
    this.year = new Date().getFullYear();
    this.yearOptions = generateYears(new Date().getFullYear());
    this.internshipSummary1 =getList(this.internships);
    this.monthList = getMonthList();
    //console.log(this.monthList);
    this.show=true;
    this.calendarView = false;
    this.companySelected ='';
    this.filterBy='';
    //function to display user data
    this.change = function(company){
      this.show=false;
      this.userDetails = getDates(company, this.internships);
    };
    //function to switch display back
    this.changeBack = function(){
      this.show=true;
      this.calendarView=false;
      this.userDisplay=[];
    };
    //function to switch to calendar view
    this.view =function (){
      this.calendarView=true;
    };
    this.update = function(){
      //console.log(this.filterBy);
      this.userDetailsInMonths = getMonths(this.filterBy, this.internships);
    };
    
    this.showLine = function(obj, monthList,counter){
      counter =  counter+1;
      return checkIfDateSelected(obj,monthList,counter,this.year,this.dateFilter);
    };
    
  }

  module.controller('OepAdminInternshipsCtrl', [
    'oepInternshipsApi', 'menu', 'internships', OepAdminInternshipsCtrl
  ]);
  //function to check if users inputed date lies within the month
  function checkIfDateSelected(obj,monthList,counter,year,dateFilter){
    //console.log(obj);
    var startYear='';
    var endYear='';
    var startMonth='';
    var endMonth='';
    if(dateFilter==='First Period'){
      startYear = obj.startYear1;
      endYear = obj.endYear1;
      startMonth = obj.startMonth1-1;
      endMonth = obj.endMonth1-1;
    }
    else {
      startYear = obj.startYear2;
      endYear = obj.endYear2;
      startMonth = obj.startMonth2-1;
      endMonth = obj.endMonth2-1;
    }
    if(startYear===year){
      if(endYear===year){
        if((startMonth)<=counter && (endMonth)>=counter ){
          console.log('here2');
          return true;
        }
      }
      else if((startMonth)<=counter){
        console.log('here3');
        return true;
      }
    }
    else if(endYear===year){
      if(endMonth>=counter){
        console.log('here4');
        return true;
      }
    }
    else if(endYear>year){
      console.log('here5');
      return true;
    }
    console.log('here6');
    return false;
  }
  
  function generateYears(currYear){
    var yearOptions=[];
    for(var i=0;i<20;i++){
      yearOptions.push(currYear++);
    }
    return yearOptions;
  }
  
  //generate month names
  function getMonthList(){
    var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames;
  }
  //function to convert dates into numbers
  function getMonths(company, internships){
    var userDetails = [];
    var userDisplay = company.users;
    //console.log(userDisplay);
    for(var i =0; i<userDisplay.length;i++){
      var user = userDisplay[i];
      for ( var j=0 ; j<internships.length ; j++){
        if(internships[j].user===user){
          var startMonth1 = new Date(internships[j].dates[0].start).getMonth()+1;
          var startYear1 = new Date(internships[j].dates[0].start).getFullYear();
          var endMonth1 = new Date(internships[j].dates[0].end).getMonth()+1;
          var endYear1 = new Date(internships[j].dates[0].end).getFullYear();
          var startMonth2 = new Date(internships[j].dates[1].start).getMonth()+1;
          var startYear2 = new Date(internships[j].dates[1].start).getFullYear();
          var endMonth2 = new Date(internships[j].dates[1].end).getMonth()+1;
          var endYear2 = new Date(internships[j].dates[1].end).getFullYear();
          var toDisplay = {'user' : user, 'startMonth1' :startMonth1,'startYear1':
          startYear1, 'endYear1' : endYear1,'endMonth1' :endMonth1, 'startMonth2'
          :startMonth2,'startYear2':startYear2, 'endYear2' : endYear2,'endMonth2'
          :endMonth2 } ;
          userDetails.push(toDisplay);
        }
        else{
          continue;
        }
      }
    }
    return userDetails;
  }
  //function to get start and end dates for each user within a specified company
  function getDates(company, internships){
    var userDetails = [];
    var userDisplay = company.users;
    for(var i =0; i<userDisplay.length;i++){
      var user = userDisplay[i];
      for ( var j=0 ; j<internships.length ; j++){
        if(internships[j].user===user){
          var toDisplay = {'user' : user, 'StartDate1' :internships[j].dates[0].start,
                             'EndDate1' :internships[j].dates[0].end, 'StartDate2'
                             :internships[j].dates[1].start,
                             'EndDate2' :internships[j].dates[1].start} ;
          userDetails.push(toDisplay);
        }
        else {
          continue;
        }
      }
    }
    return userDetails;
  }
  
  // function to get list of user with each company
  function getList(internships){
    var flag=true;
    var duplicate=true;
    var internshipSummary=[];
    for(var i=0;i<internships.length;i++){
      console.log('1');
      var tempInternship=internships[i];
      for(var tempCompany in tempInternship.companies){
        if (!tempInternship.companies.hasOwnProperty(tempCompany)) {
        //The current property is not a direct property of p
          continue;
        }
        if(internshipSummary.length>0){
          for(var k=0; k<internshipSummary.length;k++){
            if(tempCompany===internshipSummary[k].name){
              for(var l=0;l<internshipSummary[k].users.length;l++){
                if(internshipSummary[k].users[l]===tempInternship.user){
                  duplicate=false;
                  flag=false;
                }
              }
              if(duplicate){
                internshipSummary[k].users.push(tempInternship.user);
                flag=false;
                break;
              }
            }
          }
          if(flag){
            var newDetails = {'name' : tempCompany, 'users' :
                              [tempInternship.user]};
            internshipSummary.push(newDetails);
          }
        }
        else{
          var companyDetails = {'name' : tempCompany, 'users' :[tempInternship.user]} ;
          internshipSummary.push(companyDetails);
        }
      }
    }
    return internshipSummary;
  }
  /**
   * OepAdminCoursesCtrl - Controller for creating and updating courses
   *
   */
  function OepAdminCoursesCtrl(oepUsersApi, menu, courses) {
    var self = this;

    this.menu = menu;
    this.courses = courses;

    this.open = function(course) {
      oepUsersApi.courses.open(course).then(function() {
        course.opened = true;
      });
    };

    this.close = function(course) {
      oepUsersApi.courses.close(course).then(function() {
        course.opened = false;
      });
    };

    this.add = function(course) {
      oepUsersApi.courses.add(course).then(function(newCourse) {
        self.courses.push(newCourse);
        course.name = course.pw = course.opened = null;
      });
    };
  }

  module.controller('OepAdminCoursesCtrl', [
    'oepUsersApi', 'menu', 'courses', OepAdminCoursesCtrl
  ]);
  
  /**
   * OepAdminGithubCtrl - Controller for viewing and adding tracked Github repositories
   *
   */
  function OepAdminGithubCtrl(oepUsersApi, menu, repositories) {
    var self = this;

    this.repositories = repositories;
    this.menu = menu;
    
    this.add = function(repository) {
      oepUsersApi.repositories.add(repository).then(function(newRepository) {
        self.repositories.push(newRepository);
        repository.owner = repository.name = repository.url = null;
      });
    };
  }

  module.controller('OepAdminGithubCtrl', [
    'oepUsersApi', 'menu', 'repositories', OepAdminGithubCtrl
  ]);

})();