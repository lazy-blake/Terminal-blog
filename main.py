import hashlib
from datetime import datetime
from functools import wraps
from smtplib import SMTP

from flask import Flask, abort, flash, redirect, render_template, request, url_for
from flask_bootstrap import Bootstrap5
from flask_ckeditor import CKEditor
from flask_login import (
    LoginManager,
    UserMixin,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)
from werkzeug import security

from forms import CommentForm, ContactForm, LoginForm, NewPostForm, UserRegisterForm

app = Flask(__name__)
bootstrap = Bootstrap5(app)
ckeditor = CKEditor(app)
login_manager = LoginManager()


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///posts.db"
app.config["SECRET_KEY"] = "secret-key-goes-here"
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = "login"
login_manager.login_message = "Please Login to access this content"


username = "Enter email"
password = "password"
app.secret_key = "topsecret"


class Users(UserMixin, db.Model):
    __tablename__ = "Users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(250), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(250), nullable=False)
    name: Mapped[str] = mapped_column(String(250), nullable=False)

    posts = relationship("BlogPost", back_populates="author")
    comments = relationship("Comments", back_populates="user")


class BlogPost(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    author_id: Mapped[int] = mapped_column(ForeignKey("Users.id"))
    author = relationship("Users", back_populates="posts")

    title: Mapped[str] = mapped_column(String(250), unique=True, nullable=False)
    subtitle: Mapped[str] = mapped_column(String(250), nullable=False)
    date: Mapped[str] = mapped_column(String(250), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    img_url: Mapped[str] = mapped_column(String(250), nullable=False)

    comments = relationship("Comments", back_populates="blog")


class Comments(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("Users.id"))
    user = relationship("Users", back_populates="comments")

    blog_id: Mapped[int] = mapped_column(ForeignKey("blog_post.id"))
    blog = relationship("BlogPost", back_populates="comments")

    text: Mapped[str] = mapped_column(String(500), nullable=False)


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Users, int(user_id))


def gravatar_url(email, size=200, default="identicon", rating="g"):
    # Normalize and hash the email
    email = email.strip().lower().encode("utf-8")
    email_hash = hashlib.md5(email).hexdigest()

    # Return Gravatar URL
    url = (
        f"https://www.gravatar.com/avatar/{email_hash}?s={size}&d={default}&r={rating}"
    )

    return url


app.jinja_env.globals["gravatar_url"] = gravatar_url


def admin_only(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if current_user.id != 1:
            return abort(403)
        return func(*args, **kwargs)

    return wrapper


@app.route("/register", methods=["GET", "POST"])
def register():
    form = UserRegisterForm()
    if form.validate_on_submit():
        existing_user = db.session.execute(
            db.select(Users).where(Users.email == form.email.data)
        ).scalar()
        if existing_user:
            flash("This email is already registered! Try login instead")
            return redirect(url_for("login"))

        hashed_password = security.generate_password_hash(
            form.password.data, method="pbkdf2:sha256", salt_length=8
        )
        new_user = Users(
            email=form.email.data, password=hashed_password, name=form.name.data.title()
        )
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return redirect(url_for("home"))

    return render_template("register.html", form=form)


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()

        if user and security.check_password_hash(user.password, password):
            login_user(user)
            flash("Successfully logged in")
            return redirect(url_for("home"))
        else:
            flash("Invalid email or password!")
            return redirect(url_for("login"))

    return render_template("login.html", form=form)


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("home"))


@app.route("/")
def home():
    db.create_all()
    current_year = datetime.now().year
    current_month = datetime.now().strftime("%B")
    current_date = datetime.now().strftime("%d")

    # response = requests.get(URL)
    # blog_posts = response.json()
    blog_posts = db.session.execute(db.select(BlogPost)).scalars().all()
    return render_template(
        "index.html",
        posts=blog_posts,
        year=current_year,
        month=current_month,
        date=current_date,
    )


@app.route("/post/<int:post_id>", methods=["GET", "POST"])
def blogs(post_id):
    form = CommentForm()
    blog_post = db.session.execute(
        db.select(BlogPost).where(BlogPost.id == post_id)
    ).scalar()
    comments = blog_post.comments

    if form.validate_on_submit():
        if not current_user.is_authenticated:
            flash("You must be a registered user to comment on any blog")
            return redirect(url_for("login"))

        new_comment = Comments(
            text=form.comment.data, user=current_user, blog=blog_post
        )
        db.session.add(new_comment)
        db.session.commit()

        return redirect(url_for("blogs"))

    current_year = datetime.now().year
    current_month = datetime.now().strftime("%B")
    current_date = datetime.now().strftime("%d")

    return render_template(
        "post.html",
        posts=blog_post,
        year=current_year,
        month=current_month,
        date=current_date,
        form=form,
        comments=comments,
    )


@app.route("/new-post", methods=["GET", "POST"])
@admin_only
def new_post():
    form = NewPostForm()
    if form.validate_on_submit():
        title = form.title.data
        subtitle = form.subtitle.data
        img_url = form.img_url.data
        blog_content = form.blog_content.data

        new_post = BlogPost(
            title=title,
            subtitle=subtitle,
            date=datetime.now(),
            body=blog_content,
            author=current_user,
            img_url=img_url,
        )
        db.session.add(new_post)
        db.session.commit()

        return redirect(url_for("home"))

    return render_template("make-post.html", form=form, name="New Post")


@app.route("/edit-post/<post_id>", methods=["GET", "POST"])
@admin_only
def edit_post(post_id):
    post = db.get_or_404(BlogPost, post_id)
    form = NewPostForm(
        title=post.title,
        subtitle=post.subtitle,
        img_url=post.img_url,
        blog_content=post.body,
        author_name=post.author,
    )
    if form.validate_on_submit():
        post.title = form.title.data
        post.subtitle = form.subtitle.data
        post.body = form.blog_content.data
        post.img_url = form.img_url.data

        db.session.commit()

        return redirect(url_for("blogs", post_id=post_id))

    return render_template("make-post.html", form=form, name="Edit Post", post=post)


@app.route("/about")
def get_about():
    return render_template("about.html")


@app.route("/contact", methods=["GET", "POST"])
def get_contact():
    form = ContactForm()
    if form.validate_on_submit() and request.method == "POST":
        name = form.name.data
        email = form.email.data
        phone_no = form.phone.data
        msg = form.message.data

        with SMTP("smtp.gmail.com") as connection:
            connection.starttls()
            connection.login(user=username, password=password)
            connection.sendmail(
                from_addr=username,
                to_addrs="reciever address",
                msg=f"subject: Contact Me\n\nname: {name}\nemail: {email}\nphone no: {phone_no}\nmessage: {msg}",
            )

        return render_template("contact.html", success=True, form=form)

    return render_template("contact.html", form=form)


@app.route("/delete/<post_id>")
@admin_only
def delete_post(post_id):
    post = db.get_or_404(BlogPost, post_id)
    db.session.delete(post)
    db.session.commit()
    return redirect(url_for("home"))


if __name__ == "__main__":
    app.run(debug=True)
