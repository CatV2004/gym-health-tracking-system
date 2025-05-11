import { StyleSheet } from "react-native";

const PRIMARY_COLOR = "#ef440ee8";

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  gradient: {
    flex: 1,
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 25,
    marginHorizontal: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25
  },
  inputWrapper: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: '#333'
  },
  loginBtn: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  errorBox: {
    backgroundColor: '#ffeeee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffcccc'
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center'
  },
  registerBtn: {
    marginTop: 20
  },
  registerText: {
    color: '#666',
    textAlign: 'center'
  },
  registerLink: {
    color: PRIMARY_COLOR,
    fontWeight: 'bold'
  }
});

export default styles;