import numpy as np

def util_compute_distance(true_label, pred_prob, error_distance):
    """ Compute error distance """

    true_label_array = np.array(true_label)
    pred_prob_array = np.array(pred_prob)

    if error_distance == 'cosine':
        error = 1 - np.dot(true_label_array, pred_prob_array) / (np.linalg.norm(true_label_array) * np.linalg.norm(pred_prob_array))

    elif error_distance == 'manhattan':
        error = sum(np.abs(np.subtract(true_label_array, pred_prob_array)))

    elif error_distance == 'euclidean':
        error = np.linalg.norm(true_label_array - pred_prob_array)

    return error

def util_import_error_message(lib):
    """ Show import error message """

    return  ImportError('Please install ' + str(lib) + ' plugins. Then try again.')