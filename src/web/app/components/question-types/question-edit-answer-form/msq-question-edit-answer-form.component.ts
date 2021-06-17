import { Component, ElementRef, OnChanges, OnInit, ViewChild } from '@angular/core';
import {
  FeedbackMsqQuestionDetails,
  FeedbackMsqResponseDetails,
} from '../../../../types/api-output';
import { DEFAULT_MSQ_QUESTION_DETAILS, DEFAULT_MSQ_RESPONSE_DETAILS } from '../../../../types/default-question-structs';
import { MSQ_ANSWER_NONE_OF_THE_ABOVE, NO_VALUE } from '../../../../types/feedback-response-details';
import { QuestionEditAnswerFormComponent } from './question-edit-answer-form';

/**
 * The Msq question submission form for a recipient.
 */
@Component({
  selector: 'tm-msq-question-edit-answer-form',
  templateUrl: './msq-question-edit-answer-form.component.html',
  styleUrls: ['./msq-question-edit-answer-form.component.scss'],
})
export class MsqQuestionEditAnswerFormComponent
    extends QuestionEditAnswerFormComponent<FeedbackMsqQuestionDetails, FeedbackMsqResponseDetails>
    implements OnInit, OnChanges {

  readonly NO_VALUE: number = NO_VALUE;
  isMsqOptionSelected: boolean[] = [];
  lastSelectedOptionIdx: number = -1; // TODO: reset to -1 if other option or none of the above was selected
  isLastActionSelect: boolean = false;

  @ViewChild('inputTextBoxOther') inputTextBoxOther?: ElementRef;

  constructor() {
    super(DEFAULT_MSQ_QUESTION_DETAILS(), DEFAULT_MSQ_RESPONSE_DETAILS());
  }

  ngOnInit(): void {
  }

  // sync the internal status with the input data
  ngOnChanges(): void {
    this.isMsqOptionSelected = Array(this.questionDetails.msqChoices.length).fill(false);
    if (!this.isNoneOfTheAboveEnabled) {
      for (let i: number = 0; i < this.questionDetails.msqChoices.length; i += 1) {
        const indexOfElementInAnswerArray: number
            = this.responseDetails.answers.indexOf(this.questionDetails.msqChoices[i]);
        if (indexOfElementInAnswerArray > -1) {
          this.isMsqOptionSelected[i] = true;
        }
      }
    }
  }

  /**
   * Updates the answers to include/exclude the Msq option specified by the index.
   */
  updateSelectedAnswers(index: number, $event : string): void {
    let newAnswers: string[] = [];
    console.log(this.lastSelectedOptionIdx)

    if (!this.isNoneOfTheAboveEnabled) {
      newAnswers = this.responseDetails.answers.slice();
    }

    const selectedIndexInResponseArray: number = this.responseDetails.answers.indexOf(this.questionDetails.msqChoices[index]); // determines if select or deselect // should change this to a boolean so logic is clearer

    /*
    console.log("curr", selectedIndexInResponseArray);
    if (selectedIndexInResponseArray > -1) { // curr = deselect
        if ($event.shiftKey && !this.isLastActionSelect) {
            for (let i = this.lastSelectedOptionIdx; i < index; i++) {
                const j = this.responseDetails.answers.indexOf(this.questionDetails.msqChoices[i])
                newAnswers.splice(j, 1);
            }
        } else {
            newAnswers.splice(selectedIndexInResponseArray, 1); // finds the index and remove the option ('unselect')
        }
        this.isLastActionSelect = false;
    } else {
      // add the option
        // todo doesn't work for reverse direction (infinite loop)

       if ($event.shiftKey && this.isLastActionSelect) {
          for (let i = this.lastSelectedOptionIdx; i < index; i++) {
              console.log("unshifting", i, newAnswers);
              newAnswers.unshift(this.questionDetails.msqChoices[i]);
          }
      } else {
        console.log("unshifting", index);
          newAnswers.unshift(this.questionDetails.msqChoices[index]);
      }
      this.isLastActionSelect = true;
    }
    */

    const isCurrActionSelect = (selectedIndexInResponseArray === -1);

    console.log("shiftKey", $event.shiftKey, "isLastAction", this.isLastActionSelect, "curr", isCurrActionSelect) // src needed
    console.log("previous deets", this.responseDetails.answers);

    if ($event.shiftKey && (this.isLastActionSelect === isCurrActionSelect)) {
        let i = Math.min(index, this.lastSelectedOptionIdx),
            l = Math.max(index, this.lastSelectedOptionIdx);

        if (isCurrActionSelect) {
            for (; i < l; i++) {
                if (i === this.lastSelectedOptionIdx) continue; // without this you're double performing the last action
                console.log("unshift", this.questionDetails.msqChoices[i])
                newAnswers.unshift(this.questionDetails.msqChoices[i]);
            }
            this.isLastActionSelect = true;
        } else {
            for (let j; i < l; i++) {
                    if (i === this.lastSelectedOptionIdx) continue; // without this you're double performing the last action
                j = this.responseDetails.answers.indexOf(this.questionDetails.msqChoices[i])
                newAnswers.splice(j, 1);
                console.log("splice", j, this.responseDetails);
            }
            this.isLastActionSelect = false;
        }

        /*
        mistake in:
        / / / /
        / x / /
        / x / x <- everything switches off when it should be just one more off

        */

        // gmail supports one more thing
        /*
            if
            [][][][] click 1st
            [!][][][] shift click 4th
            [!][!][!][!] shift click 2nd
            [!][][][] google does this
        */


    } else {
        if (isCurrActionSelect) {
            newAnswers.unshift(this.questionDetails.msqChoices[index]);
            this.isLastActionSelect = true;
        } else {
            // remove corresponding response text
            newAnswers.splice(selectedIndexInResponseArray, 1);
            this.isLastActionSelect = false;
        }
    }

    console.log("now", newAnswers);


    this.lastSelectedOptionIdx = index;

    this.triggerResponseDetailsChange('answers', newAnswers);

    /*
    if shiftkey then
        curr = deselect &&
        prev = deselect
            then loop through indexes of and splice away
            return
        curr !== prev
            then ignore, behave as if no shiftkey (go to next)
        curr == prev == select action
            then loop through indexes
            unshift

    */
  }

  /**
   * Updates the other option checkbox when clicked.
   */
  updateIsOtherOption(): void {
    const fieldsToUpdate: any = {};
    fieldsToUpdate.isOther = !this.responseDetails.isOther;
    fieldsToUpdate.answers = this.responseDetails.answers;
    if (this.isNoneOfTheAboveEnabled) {
      fieldsToUpdate.answers = [];
    }
    if (fieldsToUpdate.isOther) {
      // create a placeholder for other answer
      fieldsToUpdate.answers.push('');
      setTimeout(() => { // focus on the text box after the isOther field is updated to enable the text box
        (this.inputTextBoxOther as ElementRef).nativeElement.focus();
      }, 0);
    } else {
      // remove other answer (last element) from the answer list
      fieldsToUpdate.answers.splice(-1, 1); // what's happening here? does the answer list have a restricted number of elements
      fieldsToUpdate.otherFieldContent = '';
    }
    this.triggerResponseDetailsChangeBatch(fieldsToUpdate);
  }

  /**
   * Updates other answer field.
   */
  updateOtherAnswerField($event: string): void { // $event is angular specific
    const fieldsToUpdate: any = {};
    // we shall update both the other field content and the answer list
    fieldsToUpdate.otherFieldContent = $event;
    fieldsToUpdate.answers = this.responseDetails.answers.slice();
    fieldsToUpdate.answers[fieldsToUpdate.answers.length - 1] = $event;
    this.triggerResponseDetailsChangeBatch(fieldsToUpdate);
  }

  /**
   * Checks if None of the above checkbox is enabled.
   */
  get isNoneOfTheAboveEnabled(): boolean {
    return !this.responseDetails.isOther && this.responseDetails.answers.length === 1
        && this.responseDetails.answers[0] === MSQ_ANSWER_NONE_OF_THE_ABOVE;
  }

  /**
   * Updates answers if None of the Above option is selected.
   */
  updateNoneOfTheAbove(): void {
    this.triggerResponseDetailsChangeBatch({
      answers: this.isNoneOfTheAboveEnabled ? [] : [MSQ_ANSWER_NONE_OF_THE_ABOVE],
      isOther: false,
      otherFieldContent: '',
    });
  }
}
