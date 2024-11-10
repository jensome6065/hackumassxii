#MACRO TRACKER 
import streamlit as st

st.title("TRAX")
st.subheader("Calculate your personalized nutrition info!")

#Daily calorie goal
age = st.number_input("What is your age?", min_value=0)
weight = st.number_input("What is your weight in pounds?", min_value=0)
height = st.number_input("What is your height roughly in feet?", min_value=0)
sex = st.text_input("What is your sex? (male or female)")
activity = st.text_input("How active are you? (none, slightly, moderately) ")
exercise = st.text_input("Did you lift today? (yes/no) ")

def find_bmr(age, weight, height, sex):
    if sex.lower() == "male":
        bmr = 66 + (10.5 * weight) + (12.9 * height) - (6.9 * age)
    else:
        bmr = 655 + (4.4 * weight) + (4.6 * height) - (4.7 * age)
    return bmr


def calculate_daily_calories(bmr, activity):
    if activity == 'none':
        calories = bmr * 1.2
    elif activity == 'slightly':
        calories = bmr * 1.4
    elif activity == 'moderately':
        calories = bmr * 1.8
    else:
        calories = bmr * 1.9
    return calories 


#Daily protein goal 

def protein_intake(weight, exercise):
    if exercise.lower() == 'no':
        protein_goal = weight * 0.36
    else:
        protein_goal = weight * 0.7
    return protein_goal


#Daily carb goal 
def carb_intake(calories):
    carbs = calories * 0.55
    return carbs 


#Daily sugar intake
def sugar_intake(sex):
    if sex.lower() == 'male':
        sugar = 'less than 36 grams'
    else:
        sugar = 'less than 25 grams'
        return sugar 



if age > 0 and weight > 0 and height > 0 and sex and activity:

    bmr = find_bmr(age, weight, height, sex)
    calories = calculate_daily_calories(bmr, activity)
    
    if calories > 0:  
        st.write(f'Your calorie intake for today should be: {int(calories)} calories')
    
    protein_goal = protein_intake(weight, exercise)
    st.write(f'Your protein goal for today should be: {int(protein_goal)} grams')

    carbs = carb_intake(calories)
    st.write(f'Your carb goal for today should be: {int(carbs)} grams')

    sugar = sugar_intake(sex)
    st.write(f'You should have {str(sugar)} of sugar today')
else:
    st.write("Please fill in all the inputs correctly.")


def clear_all():
    st.session_state.age = 0
    st.session_state.weight = 0
    st.session_state.height = 0
    st.session_state.sex = ''
    st.session_state.activity = ''
    st.session_state.exercise = ''

if st.button('Clear All'):
    clear_all()





