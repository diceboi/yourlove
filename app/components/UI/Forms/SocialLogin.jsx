

export default function SocialLogin() {
  return (
    <form action={doSocialLogin}>
      <button type="submit" name="action" value="google" className="border">
        Sign in with Google
      </button>
    </form>
  )
}
