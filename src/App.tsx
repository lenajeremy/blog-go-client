import * as React from "react";
import "./App.css";
import {useLoginMutation, useRegisterMutation} from "./api/authApi.ts";
import {AllProviders} from "./providers";
import {BlogPost, useCreateBlogPostMutation, useFetchAllPostsQuery} from "./api/blogApi.ts";

type AuthState = "login" | "register" | "home";

function App() {
    const [token, setToken] = React.useState("");
    const [authState, setAuthState] = React.useState<AuthState>(
        token ? "home" : "login"
    );

    React.useEffect(() => {
        if (!token) {
            const t = localStorage.getItem("TOKEN");
            setToken(t || "");
        } else {
            localStorage.setItem("TOKEN", token);
            setAuthState("home");
        }
    }, [token]);

    return (
        <AllProviders>
            <div>
                {authState === "login" ? (
                    <LoginForm onLoginSuccess={setToken} changeAuthState={setAuthState}/>
                ) : authState === "register" ? (
                    <RegisterForm changeAuthState={setAuthState}/>
                ) : (
                    <Home/>
                )}
            </div>
        </AllProviders>
    );
}

export default App;

function Home() {
    const {data: posts, isFetching} = useFetchAllPostsQuery()
    const [showCreatePostForm, setShowCreatePostForm] = React.useState(false)
    const [showSinglePost, setShowSinglePost] = React.useState(false)
    const [singlePost, setSinglePost] = React.useState<BlogPost | undefined>()

    return (
        <div>
            <div style={{display: "flex", alignItems: 'center', justifyContent: "space-between"}}>
                <h2>My Blog</h2>
                {
                    showCreatePostForm ? (
                        <a href={"#"} onClick={() => setShowCreatePostForm(false)} style={{color: "tomato"}}>
                            Cancel
                        </a>
                    ) : (
                        <button onClick={() => setShowCreatePostForm(true)}>+ New Post</button>
                    )
                }
            </div>
            {
                showSinglePost && singlePost && (
                    <SinglePostLarge {...singlePost} onClose={() => setShowSinglePost(false)}/>
                )
            }
            {
                showCreatePostForm ? (
                    <div style={{marginTop: '3rem'}}>
                        <CreatePostForm onCreatePostSuccess={() => setShowCreatePostForm(false)}/>
                    </div>
                ) : (
                    <div>
                        {isFetching ? (
                            <p>loading posts...</p>
                        ) : posts?.data.length === 0 ? (
                            <p>No posts found</p>
                        ) : (
                            <div
                                className="blogpost-container"
                                style={{
                                    display: "grid",
                                    gap: "1rem",
                                    marginTop: "2rem"
                                }}>
                                {posts?.data.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        clickHandler={() => {
                                            setShowSinglePost(true)
                                            setSinglePost(post)
                                        }}
                                        {...post}
                                    />)
                                )}
                            </div>
                        )
                        }
                    </div>
                )
            }
        </div>
    );
}

function SinglePostLarge(props: BlogPost & { onClose: () => void }) {
    return (
        <div
            className={"single-post-large"}
            style={{
                position: "fixed",
                height: "100vh",
                overflowY: "scroll",
                zIndex: 2000,
                top: "0",
                left: "0",
                bottom: "0",
                right: "0",
                textAlign: "left",
                padding: "2rem 8rem"
            }}>
            <h1 style={{width: '60%'}}>{props.title}</h1>
            <h3 style={{width: '40%'}}>{props.subtitle}</h3>
            <h4>{new Date(props.createdAt).toLocaleDateString()}</h4>
            <a onClick={props.onClose} href="#" className={"single-post-large--close-button"}><span>x</span></a>
            <hr/>
            <div className={"single-post-large--content"}>
                <p>{props.content}</p>
            </div>
        </div>
    )
}

function ErrorText({error}: { error: string }) {
    return (
        <p style={{color: 'tomato'}}>{error}</p>
    )
}

function PostCard(props: BlogPost & { clickHandler: () => void }) {
    return (
        <div
            onClick={props.clickHandler}
            style={{
                cursor: "pointer",
                minHeight: "150px",
                border: "1px solid lightgray",
                padding: "1rem 1.5rem",
                textAlign: "left",
                borderRadius: 16
            }}>
            <h3>{props.title}</h3>
            <p>{props.subtitle}</p>
        </div>
    )
}

function CreatePostForm({onCreatePostSuccess}: {
    onCreatePostSuccess: () => void
}) {
    const [title, setTitle] = React.useState("")
    const [subtitle, setSubtitle] = React.useState("")
    const [content, setContent] = React.useState("")
    const [createBlogPost, {isLoading: isCreatingBlogPost, error: errorCreatingBlogPost}] = useCreateBlogPostMutation()

    async function handleCreateForm(e: React.FormEvent) {
        e.preventDefault()
        try {
            const res = await createBlogPost({title, subtitle, content}).unwrap()
            if (res.success) onCreatePostSuccess()
            else alert(res.message)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <form onSubmit={handleCreateForm} style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
            {
                errorCreatingBlogPost && (
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    <p style={{color: 'tomato'}}><em>{errorCreatingBlogPost.data.error}</em></p>
                )
            }

            <input type="text" value={title} onChange={e => setTitle(e.currentTarget.value)}
                   placeholder={"Enter blog title"}/>
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.currentTarget.value)}
                   placeholder={"Enter blog subtitle"}/>
            <textarea onChange={(e) => setContent(e.currentTarget.value)} value={content}
                      placeholder={"Enter blog content"}/>
            <button disabled={isCreatingBlogPost}
                    type="submit">{isCreatingBlogPost ? "Creating..." : "Create Post"}</button>
            {isCreatingBlogPost && (
                <p>Loading...</p>
            )}

        </form>
    )
}

function RegisterForm({changeAuthState,}: { changeAuthState: (authState: AuthState) => void }) {
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [register, {isLoading, error}] = useRegisterMutation();

    async function handleSubmit() {
        try {
            const res = await register({
                firstName,
                lastName,
                email,
                password,
            }).unwrap();
            if (res.success) {
                changeAuthState("login");
            } else {
                alert(res.message);
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{display: "flex", flexDirection: "column", gap: "1rem"}}
        >
            <h2>Sign up</h2>
            <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="firstname"
            />
            <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="lastname"
            />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
            />
            <button type="submit" disabled={isLoading}>
                Register
            </button>
            {error ? <pre>{JSON.stringify(error, null, 3)}</pre> : null}
            {isLoading && <div>Loading...</div>}

            <a href="#" onClick={() => changeAuthState("login")}>
                Already have account? Login
            </a>
        </form>
    );
}

function LoginForm({onLoginSuccess, changeAuthState}: {
    onLoginSuccess: (token: string) => void;
    changeAuthState: (state: AuthState) => void;
}) {
    const [password, setPassword] = React.useState("");
    const [email, setEmail] = React.useState("");

    const [login, {isLoading, error}] = useLoginMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await login({email, password}).unwrap();

            if (res.success) {
                onLoginSuccess(res.data.token);
                changeAuthState("home");
            } else alert(res.message);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{display: "flex", flexDirection: "column", gap: "1rem"}}
        >
            <h2>Sign in</h2>
            <input
                type="text"
                value={email}
                placeholder={"Enter your email"}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                value={password}
                placeholder={"Enter your password"}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button disabled={isLoading} type="submit">
                Login
            </button>

            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/*@ts-ignore*/}
            {error ? <ErrorText error={error.data.message}/> : null}
            {isLoading && <div>Loading...</div>}
            <a href="#" onClick={() => changeAuthState("register")}>
                No account? Register
            </a>
        </form>
    );
}
