/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, Dimensions, Text } from 'react-native';

import Emoji from './Emoji';

const ANIMATION_END_Y = Dimensions.get('window').height;
const NEGATIVE_END_Y = ANIMATION_END_Y * -1;

export class AnimatedEmoji extends Component<{}> {
  /**
   * PropTypes Definition
   */
  static propTypes = {
    style: PropTypes.any,
    name: PropTypes.string.isRequired,
    onAnimationCompleted: PropTypes.func,
    index: PropTypes.number.isRequired,
  };

  static defaultProps = {
    style: [],
    onAnimationCompleted: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      position: new Animated.Value(ANIMATION_END_Y),
      isAnimationStarted: false,
    };
  }

  getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  /**
   * Function to generate input range
   * @param start
   * @param end
   * @param count
   * @returns {Array}
   */
  generateInputRanges = (start, end, count) => {
    const length = start - end;
    const segment = length / (count - 1);
    const results = [];
    results.push(start);
    for (let i = count - 2; i > 0; i--) {
      results.push(end + segment * i);
    }
    results.push(end);
    return results;
  };

  /**
   * Function to generate scale output range
   * @param count
   * @returns {Array}
   */
  generateXOutputRange = (count) => {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.random() * 50);
    }
    return results;
  };

  /**
   * Function to generate scale output range
   * @param count
   * @returns {Array}
   */
  generateScaleOutputRange = (count) => {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.random() + 1);
    }
    return results;
  };

  /**
   * Function to generate a path
   */
  generateAnimation = () => {
    /**
     * Position Y
     */
    this._yAnimation = this.state.position.interpolate({
      inputRange: [NEGATIVE_END_Y, 0],
      outputRange: [ANIMATION_END_Y, 0],
    });

    /**
     * Position X
     */
    let randomSize = this.getRandomInt(3) + 3;
    const inputRangeX = this.generateInputRanges(NEGATIVE_END_Y, 0, randomSize);

    this._xAnimation = this._yAnimation.interpolate({
      inputRange: inputRangeX,
      outputRange: this.generateXOutputRange(randomSize),
    });

    /**
     * Scale
     */
    randomSize = this.getRandomInt(2) + 2;
    const inputRangeScale = this.generateInputRanges(
      NEGATIVE_END_Y,
      0,
      randomSize
    );

    this._scaleAnimation = this._yAnimation.interpolate({
      inputRange: inputRangeScale,
      outputRange: this.generateScaleOutputRange(randomSize),
      extrapolate: 'clamp',
    });

    /**
     * Opacity
     */
    this._opacityAnimation = this._yAnimation.interpolate({
      inputRange: [
        NEGATIVE_END_Y,
        (NEGATIVE_END_Y / 4) * 3,
        (NEGATIVE_END_Y / 4) * 2,
        NEGATIVE_END_Y / 4,
        0,
      ],
      outputRange: [1, 1, 1, 0.8, 0.0],
    });

    /**
     * Rotate
     */
    this._rotateAnimation = this._yAnimation.interpolate({
      inputRange: [
        NEGATIVE_END_Y,
        (NEGATIVE_END_Y / 4) * 3,
        (NEGATIVE_END_Y / 4) * 2,
        NEGATIVE_END_Y / 4,
        0,
      ],
      outputRange: ['0deg', '-20deg', '0deg', '20deg', '0deg'],
    });
  };

  componentDidMount() {
    this.startAnimating();
  }

  startAnimating = () => {
    const { onAnimationCompleted, index } = this.props;

    /**
     * Generate animation paths
     */
    this.generateAnimation();

    /**
     * Start animating
     * Once animating is done, reset values
     */
    this.setState(
      {
        isAnimationStarted: true,
      },
      () => {
        Animated.timing(this.state.position, {
          duration: this.props.duration,
          toValue: -100,
          useNativeDriver: true,
        }).start(() => {
          this.setState({
            isAnimationStarted: false,
            position: new Animated.Value(ANIMATION_END_Y),
          });
          onAnimationCompleted(index);
        });
      }
    );
  };

  getAnimationStyle = () => {
    if (this.state.isAnimationStarted) {
      return {
        transform: [
          { translateX: this._xAnimation },
          { translateY: this.state.position },
          { scale: this._scaleAnimation },
          { rotate: this._rotateAnimation },
        ],
        opacity: this._opacityAnimation,
      };
    }

    return {};
  };

  render() {
    const { style, name, size } = this.props;

    return (
      <Animated.View
        style={[styles.container, this.getAnimationStyle(), style]}
      >
        <Text style={{ fontSize: size }}>
          <Emoji name={name} />
        </Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    transform: [{ translateY: ANIMATION_END_Y }],
  },
});
