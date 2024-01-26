import re  
  
email_re = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')  
password_re = re.compile(r'^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$')
  
def is_email_valid(email):  
    return re.fullmatch(email_re, email)
    
def is_password_valid(password):
    return re.fullmatch(password_re, password)
   