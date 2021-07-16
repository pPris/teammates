package teammates.ui.webapi;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpStatus;

import teammates.common.exception.TeammatesException;
import teammates.common.util.Logger;

/**
 * Servlet that handles the single web page.
 */
@SuppressWarnings("serial")
public class WebPageServlet extends HttpServlet {

    private static final Logger log = Logger.getLogger();

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            req.getRequestDispatcher("/index.html").forward(req, resp);
        } catch (RuntimeException e) {
            if (e.getClass().getSimpleName().equals("BadMessageException")) {
                log.warning(TeammatesException.toStringWithStackTrace(e));
                resp.setStatus(HttpStatus.SC_BAD_REQUEST);
                resp.getWriter().write(e.getMessage());
            } else {
                throw e;
            }
        }
    }

}
