/**
 * Project: darlingjs (GameEngine).
 * Copyright (c) 2013, Eugene-Krevenets
 */

/**
 * Store information about Player game process
 *
 * @class
 */
game.factory('Player', ['Levels', 'localStorageService', function (Levels, localStorageService) {
  'use strict';

  var version = '0.0.2',
    playedLevels,
    playedLevelsLocalStorageKey = 'played-levels-' + version;

  /**
   * @private
   *
   * Level state. Is played and what was result of best playing
   *
   * @class
   */
  function PlayedLevel() {
  }

  var levelAPI = PlayedLevel.prototype;
  levelAPI.maxScore = 0;
  levelAPI.passed = false;
  levelAPI.available = false;

  try {
    playedLevels = localStorageService.get(playedLevelsLocalStorageKey);
  } catch (e) {

  }

  if (!playedLevels) {
    clear();
  }

  /**
   * @public
   *
   * @returns {number}
   */
  function getScore() {
    var result = 0;
    for (var i = 0, count = playedLevels.length; i < count; i++) {
      var score = playedLevels[i].maxScore;
      result += isNaN(score) ? 0 : score;
    }
    return result;
  }

  /**
   * @public
   *
   * @param levelId
   * @param score
   */
  function finishLevel(levelId, score) {
    var playedLevel = playedLevels[levelId];
    if (darlingutil.isUndefined(playedLevel.maxScore) || playedLevel.maxScore < score) {
      playedLevel.maxScore = score;
    }

    var level = Levels.getLevelAt(levelId);

    if (level.next) {
      for (var i = 0, count = level.next.length; i < count; i++) {
        var nextLevelToPlay = playedLevels[level.next[i]];
        if (nextLevelToPlay) {
          nextLevelToPlay.available = true;
        }
      }
    }

    saveChanges();
  }

  /**
   * @public
   *
   * return levels with state - is it available for playing and is it passed.
   *
   * @returns {array}
   */
  function getPlayedLevels() {
    for (var i = 0, count = Levels.numLevels(); i < count; i++) {
      getPlayedLevelAt(i);
    }

    return Levels.getLevels();
  }

  /**
   * Return level with state of playing
   *
   * @param {number} i
   *
   * @returns {level}
   */
  function getPlayedLevelAt(i) {
    var level = Levels.getLevelAt(i);
    var playedLevel = playedLevels[i];
    if (playedLevel) {
      level.maxScore = playedLevel.maxScore;
      level.available = playedLevel.available;
      level.passed = playedLevel.passed;
      if (darlingutil.isDefined(playedLevel.maxScore) || level.available) {
        level.imgUrl = 'https://badges.webmaker.org/badge/image/image-maker.png';
      } else {
        level.imgUrl = 'https://badges.webmaker.org/badge/image/i-am-a-webmaker.png';
      }
    } else {
      level.maxScore = 0;
      level.available = false;
      level.passed = false;
    }

    return level;
  }

  /**
   * @public
   */
  function clear() {
    playedLevels = [];
    for (var i = 0, count = Levels.numLevels(); i < count; i++) {
      playedLevels.push(new PlayedLevel());
    }
    playedLevels[0].available = true;
  }

  /**
   * @private
   */
  function saveChanges() {
    localStorageService.set(playedLevelsLocalStorageKey, JSON.stringify(playedLevels));
  }

  return {
    getScore: getScore,
    finishLevel: finishLevel,
    getPlayedLevels: getPlayedLevels,
    getPlayedLevelAt: getPlayedLevelAt,

    clear: clear
  };
}]);