from flask_ckeditor import CKEditorField
from flask_wtf import FlaskForm
from wtforms import PasswordField, StringField, SubmitField, TextAreaField, validators
from wtforms.validators import DataRequired


class ContactForm(FlaskForm):
    name = StringField(
        label="Name", validators=[DataRequired(), validators.Length(min=4)]
    )
    email = StringField(
        label="Email address",
        validators=[
            DataRequired(),
            validators.Length(min=10, max=120, message=("Email length is too short")),
            validators.Email(message="Invalid email address"),
        ],
    )
    phone = StringField(
        label="Phone No",
        validators=[
            DataRequired(),
            validators.Length(min=10, message="Invalid phone no"),
        ],
    )
    message = TextAreaField(
        label="Message",
        validators=[
            DataRequired(),
            validators.Length(
                min=10, max=500, message="Message must be between 10-500 characters"
            ),
        ],
    )
    submit = SubmitField(label="Send")


class NewPostForm(FlaskForm):
    title = StringField(
        label="Blog Post Title", validators=[DataRequired(), validators.Length(min=4)]
    )
    subtitle = StringField(
        label="Subtitle",
        validators=[
            DataRequired(),
            validators.Length(min=10, max=120),
        ],
    )
    author_name = StringField(
        label="Your Name",
        validators=[
            DataRequired(),
            validators.Length(min=4),
        ],
    )
    img_url = StringField(
        label="Blog Image Url", validators=[DataRequired(), validators.URL()]
    )
    blog_content = CKEditorField(
        label="Blog Content",
        validators=[DataRequired()],
    )
    submit = SubmitField("Submit Post")


class UserRegisterForm(FlaskForm):
    email = StringField(
        label="Email",
        validators=[DataRequired(), validators.Length(min=10), validators.Email()],
    )
    password = PasswordField(
        label="Password",
        validators=[
            DataRequired(),
            validators.Length(min=8, max=120),
        ],
    )
    name = StringField(
        label="Your Name",
        validators=[
            DataRequired(),
            validators.Length(min=4),
        ],
    )
    submit = SubmitField("Register")


class LoginForm(FlaskForm):
    email = StringField(
        label="Email",
        validators=[DataRequired(), validators.Length(min=10), validators.Email()],
    )
    password = PasswordField(
        label="Password",
        validators=[
            DataRequired(),
            validators.Length(min=8, max=120),
        ],
    )
    submit = SubmitField("LogIn")


class CommentForm(FlaskForm):
    comment = CKEditorField("Commnet")
    submit = SubmitField("Comment")
