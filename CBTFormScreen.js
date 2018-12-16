import React from "react";
import { TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { get } from "lodash";
import PropTypes from "prop-types";
import {
  Container,
  GrayContainer,
  FormContainer,
  SubHeader,
  RoundedSelector,
  Row,
  Header,
  RoundedButton,
  IconButton,
} from "./ui";
import { saveExercise } from "./store";
import distortions from "./distortions";
import theme from "./theme";
import { CBT_LIST_SCREEN } from "./screens";

// This is a function instead of a constant to avoid some
// REAL weird JS bugs
const getEmptyThought = () => {
  return {
    automaticThought: "",
    cognitiveDistortions: distortions.map(label => {
      return { label, selected: false };
    }),
    challenge: "",
    alternativeThought: "",
  };
};

// Text input styles defined here instead of componentized to
// avoid issues with refs and subcomponents
const textInputStyle = {
  height: 48,
  backgroundColor: "white",
  paddingLeft: 12,
  borderRadius: 8,
  fontSize: 16,
  borderColor: theme.lightGray,
  borderWidth: 1,
  color: theme.darkText,
};
const textInputPlaceholderColor = theme.veryLightText;

class CBTForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.challenge = React.createRef();
    this.alternative = React.createRef();
  }

  render() {
    const {
      onTextChange,
      onSelectCognitiveDistortion,
      onSave,
      onDelete,
      thought,
    } = this.props;

    // We assign uuids when the thought is saved, so if it doesn't
    // have one, then the user is in the process of creating it
    const isSavedThought = !!thought.uuid; // TODO: Create edit screen

    return (
      <View
        style={{
          marginTop: 18,
        }}
      >
        <FormContainer>
          <SubHeader>Automatic Thought</SubHeader>
          <TextInput
            style={textInputStyle}
            placeholderTextColor={textInputPlaceholderColor}
            placeholder={"What's going on?"}
            value={thought.automaticThought}
            returnKeyType="next"
            blurOnSubmit={false}
            onChangeText={text => onTextChange("automaticThought", text)}
            onSubmitEditing={() => {
              this.challenge.current.focus();
            }}
          />
        </FormContainer>

        <FormContainer>
          <SubHeader>Cognitive Distortion</SubHeader>
          <RoundedSelector
            style={{
              height: 150,
            }}
            items={thought.cognitiveDistortions}
            onPress={onSelectCognitiveDistortion}
          />
        </FormContainer>

        <FormContainer>
          <SubHeader>Challenge</SubHeader>
          <TextInput
            ref={this.challenge}
            blurOnSubmit={false}
            placeholder="Debate that thought!"
            placeholderTextColor={textInputPlaceholderColor}
            returnKeyType="next"
            style={textInputStyle}
            value={thought.challenge}
            onChangeText={text => onTextChange("challenge", text)}
            onSubmitEditing={() => {
              this.alternative.current.focus();
            }}
          />
        </FormContainer>

        <FormContainer>
          <SubHeader>Alternative Thought</SubHeader>
          <TextInput
            ref={this.alternative}
            placeholder="What should we think instead?"
            placeholderTextColor={textInputPlaceholderColor}
            returnKeyType="done"
            style={textInputStyle}
            value={thought.alternativeThought}
            onChangeText={text => onTextChange("alternativeThought", text)}
          />
        </FormContainer>

        <Row>
          <RoundedButton title="Save" onPress={onSave} />
        </Row>
      </View>
    );
  }
}

CBTForm.propTypes = {
  onTextChange: PropTypes.func.isRequired,
  onSelectCognitiveDistortion: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  thought: PropTypes.object.isRequired,
};

export default class CBTFormScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = { thought: getEmptyThought() };

    this.props.navigation.addListener("willFocus", payload => {
      const thought = get(payload, "state.params.thought", false);
      if (thought) {
        this.setState({ thought });
      }
    });
  }

  onTextChange = (key, text) => {
    this.setState(prevState => {
      prevState.thought[key] = text;
      return prevState;
    });
  };

  onSave = () => {
    const {
      automaticThought,
      cognitiveDistortions,
      challenge,
      alternativeThought,
    } = this.state.thought;

    saveExercise(
      automaticThought,
      cognitiveDistortions,
      challenge,
      alternativeThought
    ).then(() => {
      this.setState(prevState => {
        prevState.thought = getEmptyThought();
        return prevState;
      });
    });
  };

  // Toggles Cognitive Distortion when selected
  onSelectCognitiveDistortion = text => {
    this.setState(prevState => {
      const { cognitiveDistortions } = prevState.thought;
      const index = cognitiveDistortions.findIndex(
        ({ label }) => label === text
      );

      cognitiveDistortions[index].selected = !cognitiveDistortions[index]
        .selected;
      return { cognitiveDistortions, ...prevState };
    });
  };

  render() {
    return (
      <KeyboardAwareScrollView
        style={{
          backgroundColor: theme.lightOffwhite,
        }}
        scrollEnabled
      >
        <Container>
          <Row>
            <Header>quirk.</Header>
            <IconButton
              featherIconName={"menu"}
              onPress={() => this.props.navigation.navigate(CBT_LIST_SCREEN)}
            />
          </Row>

          <CBTForm
            thought={this.state.thought}
            onTextChange={this.onTextChange}
            onSelectCognitiveDistortion={this.onSelectCognitiveDistortion}
            onSave={this.onSave}
          />
        </Container>
      </KeyboardAwareScrollView>
    );
  }
}

CBTFormScreen.propTypes = {
  navigation: PropTypes.any.isRequired,
};