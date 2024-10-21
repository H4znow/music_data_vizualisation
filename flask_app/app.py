from flask import Flask, render_template

app = Flask(__name__)

# Route for the homepage (index) with links to visualizations
@app.route('/')
def home():
    return render_template('index.html')

# Route for the first visualization
@app.route('/visualization1')
def visualization1():
    return render_template('visualization1.html')

# Route for the second visualization
@app.route('/visualization2')
def visualization2():
    return render_template('visualization2.html')

# Route for the third visualization
@app.route('/visualization3')
def visualization3():
    return render_template('visualization3.html')

if __name__ == '__main__':
    app.run(debug=True)
