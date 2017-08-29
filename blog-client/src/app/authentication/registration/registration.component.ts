import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ProfileService} from '../../profiles/profile.service';
import {AuthenticationService} from '../authentication.service';
import {AppState} from '../../shared/app-state';
import {Store} from '@ngrx/store';
import {ALERT_SENT} from '../../shared/alert/app-alert.reducer';
import {Alert, ALERT_ERROR_LEVEL, ALERT_SUCCESS_LEVEL} from '../../shared/alert/alert';
import {AuthenticationValidators} from './authentication-validators';

@Component({
  selector: 'app-registration',
  styleUrls: ['./registration.component.css'],
  templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit {
  form: FormGroup;

  constructor(private _fb: FormBuilder, private _profileService: ProfileService, private _authService: AuthenticationService, private _store: Store<AppState>) { }

  ngOnInit() {
    this.form = this._fb.group({
      email: new FormControl('', [Validators.required, Validators.maxLength(128), AuthenticationValidators.validateEmail]),
      username: new FormControl('',
        [Validators.required, Validators.maxLength(32)],
        [AuthenticationValidators.uniqueUsername(this._profileService, 300)]),
      password: new FormGroup({
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
        password2: new FormControl('', [Validators.required, Validators.minLength(6)])
      }, AuthenticationValidators.confirmation)
    });
  }

  isUsernameInvalid(): boolean {
    const field = this.form.get('username');
    return field.invalid && (field.dirty || field.touched);
  }

  isPasswordInvalid(): boolean {
    const field = this.form.get('password').get('password');
    return field.invalid && (field.dirty || field.touched);
  }

  isPasswordConfirmationInvalid(): boolean {
    const group = this.form.get('password'),
          field = group.get('password2');
    return (group.invalid && !this.isPasswordInvalid()) && (field.dirty || field.touched);
  }

  isEmailInvalid(): boolean {
    const field = this.form.get('email');
    return field.invalid && (field.dirty || field.touched);
  }

  isPasswordTooShort(): boolean {
    const errors = this.form.get('password').get('password').errors;
    return errors != null && (errors['required'] || errors['minlength']);
  }

  isPasswordNotConfirmed(): boolean {
    const errors = this.form.get('password').errors;
    return errors != null && errors['confirmation'];
  }

  signup(form: FormGroup) {
    this._authService
      .signup(form['email'], form['username'], form['password'])
      .subscribe(
        () => this._store.dispatch({ type: ALERT_SENT, payload: new Alert(ALERT_SUCCESS_LEVEL, 'Your account has been created, you can now log in.')}),
        err => this._store.dispatch({ type: ALERT_SENT, payload: new Alert(ALERT_ERROR_LEVEL, err['message'])}));
  }
}
