/*
 * Copyright (C) 2017 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
var fs = require('fs');
;(function() {
	'use strict'
        var slideData;
	// Create Temp SLIDE
	function getSlide(slideName) {
		//Todo: Get Slide from database
        if (typeof(slideData) === 'undefined') {
            slideData = require('../slides/' + slideName);
	    	slideData.state = {indexh: 0, indexv: 0, paused: false, overview: false};
        }
		return slideData;
	}
	
	function updateContent(id, content) {
		slideData.content = content;
		//Todo: Update Slide to database			
	}
	
	function getContent(id) {
		return slideData.content;
		//Todo: Update Slide to database			
	}
	
	function updateState(id, state) {
		slideData.state = state;
		//Todo: Update Slide to database			
	}
	
	function getState(id, state) {
		return slideData.state;
		//Todo: Update Slide to database			
	}
	
	function updateSlide(id, data) {
		slideData = data;
		//Todo: Update Slide to database			
	}
	
	function deleteSlide(slideId) {		
		// slideData.content = slide.content;
		// slideData.state = slide.state;
		
		//Todo: Delete Slide to database	
		
	}
		
	// public
	module.exports = {
		getSlide,
		updateSlide,
		updateState,
	};
})();
